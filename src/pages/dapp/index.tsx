import { useConnectModal } from "@rainbow-me/rainbowkit";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Modal from 'react-modal';
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { BASE_URL } from "../../api/constants";
import { Button, ClaimButton, ExpandAbleText, RImage as Image, PageLayout } from "../../components";
import { Row } from "../../components/layout/flex";
import { getApp } from "../../features/app/app_slice";
import { useGetDappByOwnerAddressQuery } from "../../features/dapp/dapp_api";
import { Dapp } from "../../features/dapp/models/dapp";
import { useSearchByIdQuery } from "../../features/search";
import { AppStrings } from "../constants";

Modal.setAppElement('#__next');

const modalStyles = {
    overlay: {
        background: 'rgba(0,0,0,0.80)'
    },
    content: {
        padding: 0,
        top: '80px',
        border: 0,
        background: 'transparent'
    }
}


function Divider(props) {
    return <div className="h-[1px] bg-[#2D2C33]" />
}

function SocialButton(props) {
    return <div className="bg-[#212026] p-4 rounded-lg cursor-pointer">
        <svg width="25" height="21" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24.5898 2.34187C23.6898 2.80341 22.7898 2.95726 21.7398 3.1111C22.7898 2.49572 23.5398 1.57264 23.8398 0.341872C22.9398 0.957256 21.8898 1.26495 20.6898 1.57264C19.7898 0.649564 18.4398 0.0341797 17.0898 0.0341797C13.9398 0.0341797 11.5398 3.1111 12.2898 6.18803C8.23984 6.03418 4.63984 4.03418 2.08984 0.957257C0.739844 3.26495 1.48984 6.18803 3.58984 7.72649C2.83984 7.72649 2.08984 7.4188 1.33984 7.1111C1.33984 9.4188 2.98984 11.5726 5.23984 12.188C4.48984 12.3419 3.73984 12.4957 2.98984 12.3419C3.58984 14.3419 5.38984 15.8803 7.63984 15.8803C5.83984 17.2649 3.13984 18.0342 0.589844 17.7265C2.83984 19.1111 5.38984 20.0342 8.08984 20.0342C17.2398 20.0342 22.3398 12.188 22.0398 4.95726C23.0898 4.34187 23.9898 3.4188 24.5898 2.34187Z" fill="url(#paint0_linear_119_8829)" />
            <defs>
                <linearGradient id="paint0_linear_119_8829" x1="12.5898" y1="0.0341797" x2="12.0564" y2="23.9144" gradientUnits="userSpaceOnUse">
                    <stop stop-color="white" />
                    <stop offset="1" stop-color="#D7D7D7" />
                </linearGradient>
            </defs>
        </svg>
    </div>
}


function DappDetailSection(props) {
    return (
        <section className="my-6">
            {props.title && <h1 className="text-[24px] leading-[32px] font-[500] mb-4">{props.title}</h1>}
            {props.children}
        </section>
    )
}

function DownloadButton(props) {
    const { href, dApp } = props;
    const downloadAvailable = dApp.availableOnPlatform.includes('android') || dApp.availableOnPlatform.includes('ios');
    const classnames = classNames({
        'text-[#ddd]': !downloadAvailable,
        'text-[#fff]': downloadAvailable,
        'p-4 font-[600] text-[14px]': true,
    });
    const currentColor = downloadAvailable ? "#fff" : "#525059";
    return <a className={classnames} href={downloadAvailable ? href : null}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 15V3M12 15L7 10M12 15L17 10M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke={currentColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    </a>;
}

function ClaimDappSection(props) {
    const { onClick, address, onOpenConnectModal, minted } = props;
    return (
        <Row className="items-start justify-between">
            <div className="w-8/12 flex flex-col gap-[16px]">
                <h2 className="text-[24px] text-[500] leading-[32px]">Claim this dApp</h2>
                <p className="text-[#87868C]">This dApp has not been claimed by its developers. Click here to open the Meroku platform and claim your .app domain</p>
                {!address && onOpenConnectModal && <p onClick={onOpenConnectModal} className="text-[14px] leading-[24px] underline cursor-pointer">Do you own this dApp? Connect wallet to update</p>}
            </div>
            <ClaimButton onClick={onClick}>Claim</ClaimButton>
        </Row>
    );
}

function UpdateDappSection(props) {
    const { onClick } = props;
    return (
        <Row className="items-start justify-between">
            <div className="w-8/12 flex flex-col gap-[16px]">
                <h2 className="text-[24px] text-[500] leading-[32px]">Update dApp</h2>
                <p className="text-[#87868C]">Click here to update the dApp metadata on the Meroku platform. You are seeing this because you have claimed this dApp's .app namespace</p>
            </div>
            <ClaimButton onClick={onClick}>Update</ClaimButton>
        </Row>
    );
}

function DappList(props) {
    const router = useRouter();
    const [isClaimOpen, setClaimOpen] = useState<boolean>(false);
    const { openConnectModal } = useConnectModal();
    const app = useSelector(getApp);
    const { query } = useRouter();

    useEffect(() => {
        if (isClaimOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isClaimOpen]);
    console.log(
        "query.id",
        query.id
    )

    const {
        data,
        isFetching,
        isLoading,
    } = useSearchByIdQuery(query.id, {
        page: 1,
        limit: 1,
        chainId: app.chainId,
    }, {
        refetchOnMountOrArgChange: false
    });

    console.log(
        "Data - item",
        data
    )
    console.log(
        "isFetching",
        isFetching,
        "isLoading",
        isLoading,
    )
    const { address } = useAccount();

    const {
        ownedApps,
        isOwnedAppsLoading,
    } = useGetDappByOwnerAddressQuery(address, {
        skip: (address === undefined) && (isLoading || isFetching || !data[0]?.minted)
    });

    console.log("yout are herererrr");
    console.log("Data-item-2", data);
    if (isLoading || isFetching) return
    <PageLayout>
        <div className="shimmer w-full h-[400px] mb-[16px] rounded-lg" />
        <div className="shimmer w-full h-[100px] mb-[16px] rounded-lg" />
        <div className="shimmer w-full h-[100px] mb-[16px] rounded-lg" />
        <div className="shimmer w-full h-[100px] mb-[16px] rounded-lg" />
    </PageLayout>
    console.log("you are herererrr");

    if (!data) return <PageLayout>Missing post!</PageLayout>
    console.log("you are herererrr 2");

    const dApp: Dapp = data.data[0];

    console.log("you are herererrr 3");


    if (!dApp) {
        return <PageLayout>Missing post!</PageLayout>
    }

    const history = JSON.parse(localStorage.getItem('dApps') ?? "{}");
    localStorage.setItem('dApps', JSON.stringify(Object.assign({}, history, { [dApp.dappId]: dApp })));
    const args = new URLSearchParams();
    if (address) {
        args.set('userAddress', address);
    }
    const viewLink = `${BASE_URL}/o/view/${dApp.dappId}?${args.toString()}`
    const downloadLink = `${BASE_URL}/o/download/${dApp.dappId}?${args.toString()}`

    const isOwner = isOwnedAppsLoading ? false : (ownedApps?.data?.includes(dApp.dappId) || false)

    const getIframeSrc = (): string => {
        return isOwner ? 'https://app.meroku.org/update' : 'https://app.meroku.org/app'
    }

    const onClaimButtonClick = () => {
        if (!!address) {
            setClaimOpen(true)
            return
        } else if (openConnectModal) {
            openConnectModal();
        }
    };
    return (
        <PageLayout>
            <div className="flex flex-col">
                <div className="mb-6 cursor-pointer" onClick={router.back}>
                    <svg className="inline-block mr-2" width="24" height="24" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 19.5001L5 12.5001M5 12.5001L12 5.50012M5 12.5001H19" stroke="#E2E1E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-2xl">{AppStrings.allDapps}</span>
                </div>
                {dApp.images.banner && <div className="z-0 relative top-[16px] lg:top-[48px] w-full h-[200px] lg:h-[400px]">
                    <Image src={dApp.images.banner} placeholder={"/assets/images/banner_placeholder.png"} fill={true} alt="DApp Banner" className="aspect-video	rounded-lg object-cover	" />
                </div>}
                <section>
                    <header className="z-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 px-[8px] lg:px-[16px]">
                        <div className="flex-auto flex flex-row items-end  gap-[16px] pl-[8px] md:pl-0">
                            <div className="relative bg-canvas-color flex-initial rounded-2xl w-[74px relative] w-[64px] h-[64px] lg:w-[132px] lg:h-[132px]">
                                <Image sizes="(max-width: 768px) 100vw,
                                          (max-width: 1200px) 50vw,
                                          33vw"
                                    style={{ aspectRatio: 1 }}
                                    fill={true}
                                    src={dApp.images.logo}
                                    className="rounded-lg w-[64px] lg:w-[64px] "
                                    alt="" />
                            </div>
                            <div className="flex-auto  pt-4">
                                <p className="text-[12px] leading-[16px] md:text-[16px] md:leading-[20px] uppercase my-2">{dApp.category}</p>
                                <p className="text-[16px] leading-[20px] md:text-[32px] md:leading-[38px] font-[600] line-clamp-1">{dApp.name}</p>
                            </div>
                        </div>
                        <div className="flex-initial flex">
                            <Button as="a" className="flex flex-grow" target="_blank"
                                href={viewLink}>
                                <div className="text-[12px] leading-[16px] lg:text-[14px] font-[500]">{AppStrings.visitDapp}</div>
                                <svg className="mx-2 w-[16px] hover:text-black" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 17L17 7M17 7V17M17 7H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round" />
                                </svg>
                            </Button>
                            <a className="p-4 font-[600] text-[14px]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.59003 13.51L15.42 17.49M15.41 6.51001L8.59003 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="#E2E1E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </a>
                            <DownloadButton href={downloadLink} dApp={dApp} />
                        </div>
                    </header>
                    <DappDetailSection title={AppStrings.about}>
                        <ExpandAbleText maxCharacters={320} maxLines={3}>{dApp.description}</ExpandAbleText>
                    </DappDetailSection>
                    <Divider />
                    {dApp.images.screenshots?.length && (<>
                        <DappDetailSection title={AppStrings.gallery}>
                            <div className="grid grid-cols-3 gap-4">
                                {dApp.images.screenshots?.map((e, idx) => <img key={idx} src={e || ''} alt="DApp Screenshot" />)}
                            </div>
                        </DappDetailSection>
                        <Divider />
                    </>)
                    }
                    <DappDetailSection>
                        {!!address && isOwner ?
                            <UpdateDappSection onClick={onClaimButtonClick} /> :
                            <ClaimDappSection address={address} onClick={onClaimButtonClick} onOpenConnectModal={openConnectModal} minted={dApp.minted} />}

                        {/*                         
                        {!(address == undefined) ?
                            isOwner ?
                                <UpdateDappSection onClick={onClaimButtonClick} /> :
                                !((dApp.minted == undefined) || (!dApp.minted)) ?
                                       ( openConnectModal && <p onClick={openConnectModal} className="text-[14px] leading-[24px] underline cursor-pointer">Do you own this dApp? Connect wallet to update</p>) :
                                        <ClaimDappSection address={address} onClick={onClaimButtonClick} onOpenConnectModal={openConnectModal}/>:
                            <ClaimDappSection address={address} onClick={onClaimButtonClick} onOpenConnectModal={openConnectModal}/>} */}
                    </DappDetailSection>
                </section>
            </div>
            {isClaimOpen && <Modal
                isOpen={isClaimOpen}
                onRequestClose={() => setClaimOpen(false)}
                style={modalStyles}
            >
                <div className="w-full m-auto">
                    <div className="flex justify-end ">
                        <button onClick={() => setClaimOpen(false)}>
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M27.5291 9L19.8848 16.6459L12.2404 9L10 11.2404L17.6459 18.8848L10 26.5291L12.2404 28.7695L19.8848 21.1236L27.5291 28.7695L29.7695 26.5291L22.1236 18.8848L29.7695 11.2404L27.5291 9Z"
                                    fill="white" />
                            </svg>
                        </button>
                    </div>
                    <div className="bg-canvas-color">
                        <iframe className="w-full rounded-[16px] min-h-screen" src={getIframeSrc()} />
                    </div>
                </div>
            </Modal>}
        </PageLayout>
    );
}

export default DappList;