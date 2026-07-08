import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";
import Thumb from "@assets/thumb.png";
import AppHeader from "@components/layout/AppHeader";
import AppBottomNav from "@/components/layout/AppBottomNav";
import {
    getOcops,
    getOcopTypes,
    type Ocop,
    type OcopType,
} from "@/services/ocop";

type Category = {
    id: string;
    label: string;
};

const ALL_CATEGORY_ID = "all";

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: #f3f7fb;
    color: #082b55;
    padding: 112px 0 96px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 0 14px;
`;

const TabRow = styled.div`
    display: flex;
    gap: 9px;
    margin: 16px 0 20px;
    overflow-x: auto;
    padding-bottom: 2px;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const TabButton = styled.button<{ $active?: boolean }>`
    min-height: 44px;
    border: 1px solid ${({ $active }) => ($active ? "#0878bd" : "#d4e6f4")};
    border-radius: 999px;
    padding: 10px 14px;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 800;
    text-align: center;
    white-space: nowrap;

    color: ${({ $active }) => ($active ? "#ffffff" : "#164b78")};
    background: ${({ $active }) =>
        $active
            ? "linear-gradient(135deg, #075d9c 0%, #0788cf 100%)"
            : "#ffffff"};

    box-shadow: ${({ $active }) =>
        $active
            ? "0 9px 18px rgba(7, 120, 189, 0.24)"
            : "0 6px 16px rgba(17, 76, 120, 0.06)"};

    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    &:active {
        transform: scale(0.97);
    }
`;

const ProductList = styled.div`
    display: grid;
    gap: 14px;
    margin-bottom: 24px;
`;

const ProductCard = styled.button`
    width: 100%;
    border: 1px solid #e3edf5;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 10px 24px rgba(11, 73, 121, 0.07);
    display: flex;
    gap: 13px;
    padding: 13px;
    text-align: left;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:active {
        transform: scale(0.985);
        box-shadow: 0 6px 16px rgba(11, 73, 121, 0.1);
    }
`;

const ProductImage = styled.div<{ $image: string }>`
    width: 84px;
    height: 84px;
    border-radius: 17px;
    background: url(${({ $image }) => $image}) center/cover;
    flex-shrink: 0;
    border: 1px solid #e0ebf4;
`;

const ProductInfo = styled.div`
    min-width: 0;
    display: grid;
    gap: 6px;
    flex: 1;
`;

const ProductName = styled.h2`
    margin: 0;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.3;
    font-weight: 900;
    color: #082b55;
`;

const ProductSubtitle = styled.p`
    margin: 0;
    color: #66829c;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const ProductFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    color: #0878bd;
`;

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 7px 11px;
    border-radius: 999px;
    background: #fff5d9;
    color: #b46800;
    border: 1px solid #ffe5a5;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 900;
`;

const StateBox = styled.div`
    margin-top: 28px;
    padding: 32px 18px;
    border-radius: 20px;
    text-align: center;
    background: #ffffff;
    border: 1px solid #e3edf5;
    box-shadow: 0 10px 24px rgba(11, 73, 121, 0.07);
    color: #66829c;
    font-size: calc(15px * var(--app-font-scale));
`;

const LoadingBox = styled(StateBox)`
    display: grid;
    gap: 12px;
    place-items: center;
`;

function getTypeLabel(type: OcopType) {
    return type.name ?? type.title ?? "Danh mục OCOP";
}

function getProductTitle(product: Ocop) {
    return product.name ?? product.title ?? "Sản phẩm OCOP";
}

function getProductSubtitle(product: Ocop) {
    return (
        product.description ??
        product.producer ??
        product.ownerName ??
        product.address ??
        "Thông tin sản phẩm OCOP địa phương"
    );
}

function getProductImage(product: Ocop) {
    if (product.imageUrl) {
        return product.imageUrl;
    }

    if (Array.isArray(product.images) && product.images[0]) {
        return product.images[0];
    }

    return Thumb;
}

function getProductBadge(product: Ocop) {
    const star = product.stars ?? product.rating;

    if (star) {
        return `OCOP ${star}★`;
    }

    return "OCOP";
}

function getProductTypeId(product: Ocop) {
    return product.typeId ?? product.ocopType?.id ?? "";
}

const OCOPPage: React.FC = () => {
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] =
        useState<string>(ALL_CATEGORY_ID);

    const [types, setTypes] = useState<OcopType[]>([]);
    const [products, setProducts] = useState<Ocop[]>([]);

    const [loadingTypes, setLoadingTypes] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState("");

    const categories = useMemo<Category[]>(
        () => [
            {
                id: ALL_CATEGORY_ID,
                label: "Tất cả",
            },
            ...types.map(type => ({
                id: type.id,
                label: getTypeLabel(type),
            })),
        ],
        [types],
    );

    const filteredProducts = useMemo(() => {
        if (selectedCategory === ALL_CATEGORY_ID) {
            return products;
        }

        return products.filter(
            product => getProductTypeId(product) === selectedCategory,
        );
    }, [products, selectedCategory]);

    useEffect(() => {
        let active = true;

        async function loadTypes() {
            try {
                setLoadingTypes(true);
                setError("");

                const data = await getOcopTypes();

                if (!active) {
                    return;
                }

                setTypes(data);
            } catch (err) {
                if (!active) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải danh mục OCOP.",
                );
            } finally {
                if (active) {
                    setLoadingTypes(false);
                }
            }
        }

        loadTypes();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        async function loadProducts() {
            try {
                setLoadingProducts(true);
                setError("");

                const typeId =
                    selectedCategory === ALL_CATEGORY_ID
                        ? undefined
                        : selectedCategory;

                const result = await getOcops({
                    page: 0,
                    size: 20,
                    typeId,
                });

                if (!active) {
                    return;
                }

                setProducts(result.data);
            } catch (err) {
                if (!active) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải danh sách sản phẩm OCOP.",
                );
                setProducts([]);
            } finally {
                if (active) {
                    setLoadingProducts(false);
                }
            }
        }

        loadProducts();

        return () => {
            active = false;
        };
    }, [selectedCategory]);

    let content: React.ReactNode;

    if (loadingTypes || loadingProducts) {
        content = (
            <LoadingBox>
                <Spinner />
                Đang tải sản phẩm OCOP...
            </LoadingBox>
        );
    } else if (error) {
        content = <StateBox>{error}</StateBox>;
    } else if (filteredProducts.length > 0) {
        content = (
            <ProductList>
                {filteredProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        onClick={() => navigate(`/ocops/${product.id}`)}
                        type="button"
                    >
                        <ProductImage $image={getProductImage(product)} />

                        <ProductInfo>
                            <ProductName>
                                {getProductTitle(product)}
                            </ProductName>

                            <ProductSubtitle>
                                {getProductSubtitle(product)}
                            </ProductSubtitle>

                            <ProductFooter>
                                <Badge>{getProductBadge(product)}</Badge>

                                <Icon icon="zi-chevron-right" size={18} />
                            </ProductFooter>
                        </ProductInfo>
                    </ProductCard>
                ))}
            </ProductList>
        );
    } else {
        content = (
            <ProductList>
                <StateBox>Chưa có sản phẩm OCOP phù hợp.</StateBox>
            </ProductList>
        );
    }

    return (
        <PageWrapper>
            <AppHeader
                back
                title="Sản phẩm"
                description="Khám phá sản phẩm OCOP, đặc sản vùng và sản phẩm hợp tác xã"
                onBack={() => navigate(-1)}
            />

            <Content>
                <TabRow>
                    {categories.map(category => (
                        <TabButton
                            key={category.id}
                            $active={category.id === selectedCategory}
                            onClick={() => setSelectedCategory(category.id)}
                            type="button"
                        >
                            {category.label}
                        </TabButton>
                    ))}
                </TabRow>

                {content}
            </Content>

            <AppBottomNav />
        </PageWrapper>
    );
};

export default OCOPPage;
