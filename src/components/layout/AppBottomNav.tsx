import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "zmp-ui";
import { useLocation } from "react-router-dom";
import CompanyLogo from "@assets/logo.png";

import home from "@/assets/icons/home-button.png";
import news from "@/assets/icons/options.png";
import community from "@/assets/icons/bubble-chat.png";
import notifications from "@/assets/icons/notification-bell.png";
import profile from "@/assets/icons/user.png";

export type BottomNavKey =
    | "home"
    | "news"
    | "community"
    | "notifications"
    | "profile";

type AppBottomNavProps = {
    activeKey?: BottomNavKey;
};

const navItems: Array<{
    key: BottomNavKey;
    label: string;
    icon: string;
    path: string;
}> = [
    {
        key: "home",
        label: "Trang chủ",
        icon: home,
        path: "/",
    },
    {
        key: "news",
        label: "Tin tức",
        icon: news,
        path: "/news",
    },
    {
        key: "community",
        label: "Cộng đồng",
        icon: community,
        path: "/feedbacks",
    },
    {
        key: "notifications",
        label: "Thông báo",
        icon: notifications,
        path: "/notifications",
    },
    {
        key: "profile",
        label: "Tài khoản",
        icon: profile,
        path: "/profile",
    },
];

function getActiveKey(pathname: string): BottomNavKey {
    if (pathname === "/" || pathname === "/index.html") {
        return "home";
    }

    if (pathname.startsWith("/news")) {
        return "news";
    }

    if (
        pathname.startsWith("/feedback") ||
        pathname.startsWith("/feedbacks") ||
        pathname.startsWith("/create-feedback")
    ) {
        return "community";
    }

    if (pathname.startsWith("/notifications")) {
        return "notifications";
    }

    if (
        pathname.startsWith("/profile") ||
        pathname.startsWith("/account-info") ||
        pathname.startsWith("/government-contact") ||
        pathname.startsWith("/loyalty-points") ||
        pathname.startsWith("/sync-history")
    ) {
        return "profile";
    }

    return "home";
}

const AppBottomNav: React.FC<AppBottomNavProps> = ({ activeKey }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const triggerScrolling = () => {
            setIsScrolling(true);

            if (scrollTimerRef.current) {
                window.clearTimeout(scrollTimerRef.current);
            }

            scrollTimerRef.current = window.setTimeout(() => {
                setIsScrolling(false);
            }, 220);
        };

        window.addEventListener("scroll", triggerScrolling, { passive: true });
        document.addEventListener("scroll", triggerScrolling, {
            passive: true,
            capture: true,
        });
        document.addEventListener("touchmove", triggerScrolling, {
            passive: true,
        });
        document.addEventListener("wheel", triggerScrolling, { passive: true });

        return () => {
            window.removeEventListener("scroll", triggerScrolling);
            document.removeEventListener("scroll", triggerScrolling, {
                capture: true,
            });
            document.removeEventListener("touchmove", triggerScrolling);
            document.removeEventListener("wheel", triggerScrolling);

            if (scrollTimerRef.current) {
                window.clearTimeout(scrollTimerRef.current);
            }
        };
    }, []);

    const currentActiveKey = useMemo(
        () => activeKey ?? getActiveKey(location.pathname),
        [activeKey, location.pathname],
    );

    return (
        <BottomNav>
            <BottomNavLogo $expanded={isScrolling} aria-label="Logo công ty">
                <BottomNavLogoImage src={CompanyLogo} alt="Skill Trip X" />
            </BottomNavLogo>

            {navItems.map(item => {
                const active = item.key === currentActiveKey;

                return (
                    <NavItem
                        key={item.key}
                        $active={active}
                        onClick={() => navigate(item.path)}
                        type="button"
                    >
                        <IconBox $active={active}>
                            <NavIconImage
                                src={item.icon}
                                alt={item.label}
                                $active={active}
                            />
                        </IconBox>

                        <span>{item.label}</span>
                    </NavItem>
                );
            })}
        </BottomNav>
    );
};

export default AppBottomNav;

const BottomNav = styled.nav`
    position: fixed;
    right: 0;
    bottom: 0;
    left: 50%;
    z-index: 22;

    display: grid;
    grid-template-columns: repeat(5, 1fr);

    width: min(100vw, 430px);
    height: calc(68px + var(--zaui-safe-area-inset-bottom, 0px));
    padding-bottom: var(--zaui-safe-area-inset-bottom, 0px);
    box-sizing: border-box;

    transform: translateX(-50%);

    border-top: 1px solid #dce8f1;
    background: rgba(255, 255, 255, 0.97);
    box-shadow: 0 -6px 18px rgba(31, 77, 110, 0.08);
`;

const BottomNavLogo = styled.div<{ $expanded?: boolean }>`
    position: absolute;
    left: 50%;
    top: ${({ $expanded }) => ($expanded ? "-48px" : "-34px")};
    transform: translateX(-50%)
        scale(${({ $expanded }) => ($expanded ? 1.05 : 1)});
    z-index: 3;

    width: ${({ $expanded }) => ($expanded ? "132px" : "112px")};
    height: ${({ $expanded }) => ($expanded ? "38px" : "28px")};

    display: grid;
    place-items: center;

    padding: ${({ $expanded }) => ($expanded ? "7px 12px" : "5px 10px")};

    background: rgba(255, 255, 255, 0.98);

    border: 1px solid rgba(0, 83, 145, 0.08);
    border-bottom: 0;
    border-radius: ${({ $expanded }) =>
        $expanded ? "20px 20px 0 0" : "16px 16px 0 0"};

    box-shadow: ${({ $expanded }) =>
        $expanded
            ? "0 -8px 20px rgba(0, 75, 134, 0.16)"
            : "0 -4px 12px rgba(0, 75, 134, 0.1)"};

    pointer-events: none;

    transition: width 0.25s ease, height 0.25s ease, top 0.25s ease,
        padding 0.25s ease, transform 0.25s ease, border-radius 0.25s ease,
        box-shadow 0.25s ease;

    &::after {
        content: "";
        position: absolute;
        left: -1px;
        right: -1px;
        bottom: -16px;
        height: 18px;
        background: rgba(255, 255, 255, 0.98);
    }
`;

const BottomNavLogoImage = styled.img`
    position: relative;
    z-index: 1;

    width: 100%;
    height: 100%;

    display: block;
    object-fit: contain;
`;

const NavItem = styled.button<{ $active?: boolean }>`
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;

    border: 0;
    background: transparent;

    color: ${({ $active }) => ($active ? "#0067a8" : "#9aaabb")};

    font-size: calc(10px * var(--app-font-scale));
    line-height: 1.1;
    font-weight: ${({ $active }) => ($active ? 850 : 650)};

    transition: all 0.2s ease;

    &::before {
        content: "";
        position: absolute;
        top: 0;

        width: 26px;
        height: 3px;

        border-radius: 999px;
        background: ${({ $active }) => ($active ? "#0070b5" : "transparent")};
    }

    span {
        color: ${({ $active }) => ($active ? "#005f99" : "#9aaabb")};
    }

    &:active {
        background: #f0f8fd;
    }
`;

const IconBox = styled.div<{ $active?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;

    border-radius: 999px;

    background: ${({ $active }) => ($active ? "#e7f5ff" : "transparent")};

    transform: ${({ $active }) => ($active ? "translateY(-2px)" : "none")};
    transition: all 0.2s ease;
`;

const NavIconImage = styled.img<{ $active?: boolean }>`
    width: ${({ $active }) => ($active ? "25px" : "23px")};
    height: ${({ $active }) => ($active ? "25px" : "23px")};

    display: block;
    object-fit: contain;

    opacity: ${({ $active }) => ($active ? 1 : 0.62)};
    filter: ${({ $active }) =>
        $active
            ? "drop-shadow(0 4px 7px rgba(0, 103, 168, 0.22))"
            : "grayscale(0.15)"};

    transition: width 0.2s ease, height 0.2s ease, opacity 0.2s ease,
        filter 0.2s ease;
`;
