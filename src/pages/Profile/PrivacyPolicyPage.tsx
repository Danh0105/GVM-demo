import AppBottomNav from "@/components/layout/AppBottomNav";
import AppHeader from "@components/layout/AppHeader";
import React from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";

type PolicyItem = {
    icon: React.ComponentProps<typeof Icon>["icon"];
    title: string;
    description: string;
};

const policyItems: PolicyItem[] = [
    {
        icon: "zi-user",
        title: "Thông tin cá nhân",
        description:
            "Ứng dụng chỉ thu thập các thông tin cần thiết như họ tên, số điện thoại, ảnh đại diện hoặc thông tin tài khoản Zalo khi người dùng cho phép.",
    },
    {
        icon: "zi-file",
        title: "Mục đích sử dụng",
        description:
            "Thông tin được sử dụng để định danh người dùng, hỗ trợ gửi phản ánh, tra cứu hồ sơ, nhận thông báo và sử dụng các dịch vụ công trực tuyến.",
    },
    {
        icon: "zi-lock",
        title: "Bảo mật dữ liệu",
        description:
            "Dữ liệu cá nhân được lưu trữ và xử lý theo nguyên tắc bảo mật, hạn chế truy cập trái phép, thất thoát hoặc sử dụng sai mục đích.",
    },
    {
        icon: "zi-call",
        title: "Chia sẻ thông tin",
        description:
            "Ứng dụng không bán, trao đổi hoặc chia sẻ thông tin cá nhân cho bên thứ ba, trừ khi có yêu cầu từ cơ quan có thẩm quyền theo quy định pháp luật.",
    },
    {
        icon: "zi-setting",
        title: "Quyền của người dùng",
        description:
            "Người dùng có quyền yêu cầu kiểm tra, cập nhật hoặc điều chỉnh thông tin cá nhân đã cung cấp trong quá trình sử dụng ứng dụng.",
    },
];

const PrivacyPolicyPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PrivacyPage id="privacy-policy-page">
            <AppHeader
                back
                title="Chính sách bảo mật"
                onBack={() => navigate("/profile", { direction: "backward" })}
            />

            <Content>
                <HeroCard>
                    <HeroIcon>
                        <Icon icon="zi-shield-solid" size={34} />
                    </HeroIcon>

                    <HeroTitle>Chính sách bảo mật</HeroTitle>

                    <HeroDescription>
                        Chính sách này giải thích cách ứng dụng thu thập, sử
                        dụng, lưu trữ và bảo vệ thông tin cá nhân của người dân
                        khi sử dụng các dịch vụ trên nền tảng.
                    </HeroDescription>

                    <UpdatedText>Cập nhật lần cuối: 16/06/2026</UpdatedText>
                </HeroCard>

                <SectionTitle>Quy định bảo mật</SectionTitle>

                <PolicyList>
                    {policyItems.map(item => (
                        <PolicyCard key={item.title}>
                            <PolicyIcon>
                                <Icon icon={item.icon} size={22} />
                            </PolicyIcon>

                            <PolicyContent>
                                <PolicyTitle>{item.title}</PolicyTitle>
                                <PolicyDescription>
                                    {item.description}
                                </PolicyDescription>
                            </PolicyContent>
                        </PolicyCard>
                    ))}
                </PolicyList>

                <NoticeCard>
                    <NoticeTitle>Cam kết bảo vệ thông tin</NoticeTitle>
                    <NoticeText>
                        Ứng dụng cam kết chỉ sử dụng thông tin cá nhân đúng mục
                        đích phục vụ người dân, không tự ý công khai hoặc chuyển
                        giao thông tin khi chưa có sự đồng ý của người dùng, trừ
                        trường hợp pháp luật có quy định khác.
                    </NoticeText>
                </NoticeCard>

                <ContactCard>
                    <ContactIcon>
                        <Icon icon="zi-call" size={22} />
                    </ContactIcon>

                    <div>
                        <ContactTitle>Liên hệ hỗ trợ</ContactTitle>
                        <ContactText>
                            Nếu có thắc mắc về chính sách bảo mật, vui lòng liên
                            hệ chính quyền địa phương hoặc bộ phận hỗ trợ của
                            ứng dụng.
                        </ContactText>
                    </div>
                </ContactCard>
            </Content>

            <AppBottomNav activeKey="profile" />
        </PrivacyPage>
    );
};

export default PrivacyPolicyPage;

const PrivacyPage = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 104px 0 104px;
    background: #f6f8fb;
    color: #172033;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
`;

const Content = styled.main`
    padding: 18px 16px 0;
`;

const HeroCard = styled.section`
    position: relative;
    overflow: hidden;
    border-radius: 26px;
    padding: 24px 20px;
    color: #ffffff;
    background: linear-gradient(135deg, #005f9f 0%, #0077b6 52%, #0096c7 100%);
    box-shadow: 0 18px 36px rgba(0, 83, 145, 0.22);

    &::after {
        content: "";
        position: absolute;
        right: -44px;
        top: -48px;
        width: 148px;
        height: 148px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
    }
`;

const HeroIcon = styled.div`
    width: 62px;
    height: 62px;
    border-radius: 22px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.16);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
`;

const HeroTitle = styled.h1`
    position: relative;
    z-index: 1;
    margin: 18px 0 10px;
    font-size: calc(28px * var(--app-font-scale));
    line-height: 1.12;
    font-weight: 950;
`;

const HeroDescription = styled.p`
    position: relative;
    z-index: 1;
    margin: 0;
    color: rgba(255, 255, 255, 0.88);
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.55;
    font-weight: 600;
`;

const UpdatedText = styled.div`
    position: relative;
    z-index: 1;
    width: fit-content;
    margin-top: 18px;
    border-radius: 999px;
    padding: 8px 12px;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.14);
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 800;
`;

const SectionTitle = styled.h2`
    margin: 24px 2px 14px;
    color: #172033;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.18;
    font-weight: 950;
`;

const PolicyList = styled.div`
    display: grid;
    gap: 12px;
`;

const PolicyCard = styled.article`
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 14px;
    align-items: flex-start;
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 22px;
    padding: 16px;
    background: #ffffff;
    box-shadow: 0 12px 28px rgba(30, 35, 50, 0.08);
`;

const PolicyIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    color: #0063a7;
    background: #e6f7ff;
`;

const PolicyContent = styled.div`
    min-width: 0;
`;

const PolicyTitle = styled.h3`
    margin: 0 0 6px;
    color: #172033;
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 900;
`;

const PolicyDescription = styled.p`
    margin: 0;
    color: #667085;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.5;
    font-weight: 550;
`;

const NoticeCard = styled.section`
    margin-top: 18px;
    border: 1px solid rgba(229, 9, 32, 0.1);
    border-radius: 22px;
    padding: 18px;
    background: #fff5f5;
`;

const NoticeTitle = styled.h3`
    margin: 0 0 8px;
    color: #b42318;
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
`;

const NoticeText = styled.p`
    margin: 0;
    color: #7a271a;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.55;
    font-weight: 600;
`;

const ContactCard = styled.section`
    margin-top: 14px;
    display: grid;
    grid-template-columns: 46px 1fr;
    gap: 12px;
    align-items: flex-start;
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 22px;
    padding: 16px;
    background: #ffffff;
    box-shadow: 0 10px 24px rgba(30, 35, 50, 0.07);
`;

const ContactIcon = styled.div`
    width: 46px;
    height: 46px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: linear-gradient(135deg, #e50920, #f22433);
`;

const ContactTitle = styled.h3`
    margin: 0 0 6px;
    color: #172033;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
`;

const ContactText = styled.p`
    margin: 0;
    color: #667085;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.5;
    font-weight: 550;
`;
