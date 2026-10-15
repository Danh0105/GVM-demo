import CampusPhoto from "@/assets/school-campus.jpg";
import ClassroomPhoto from "@/assets/school-classroom.jpg";
import BuildingPhoto from "@/assets/school-building.jpg";

export type School = {
    id: string;
    code: string;
    name: string;
    level: string;
    area: string;
    ownership: string;
    address: string;
    principal: string;
    established: number;
    students: number;
    teachers: number;
    staff: number;
    classes: number;
    attendance: number;
    digital: number;
    pending: number;
    rooms: number;
    computers: number;
    smartRooms: number;
    facilities: string[];
    photo: string;
};

export const SCHOOL_PORTAL = "https://admin.skilltripx.com.vn/demo-truong-demo";
export const levels = ["Mầm non", "Tiểu học", "THCS", "THPT"];
export const areas = ["Gò Dầu", "Trảng Bàng", "Hòa Thành", "Tây Ninh"];
export const schools: School[] = [
    {
        id: "mn-hoa-sen",
        code: "TN-MN-001",
        name: "Mầm non Hoa Sen",
        level: "Mầm non",
        area: "Gò Dầu",
        ownership: "Công lập",
        address: "12 đường Hoa Sen, khu phố 1, Gò Dầu, Tây Ninh",
        principal: "Nguyễn Thị Mai",
        established: 2004,
        students: 320,
        teachers: 28,
        staff: 9,
        classes: 12,
        attendance: 97.2,
        digital: 92,
        pending: 3,
        rooms: 16,
        computers: 18,
        smartRooms: 8,
        facilities: [
            "Sân chơi",
            "Bếp ăn một chiều",
            "Phòng y tế",
            "Camera an ninh",
        ],
        photo: CampusPhoto,
    },
    {
        id: "th-go-dau",
        code: "TN-TH-002",
        name: "Tiểu học Gò Dầu",
        level: "Tiểu học",
        area: "Gò Dầu",
        ownership: "Công lập",
        address: "28 đường Hùng Vương, khu phố 2, Gò Dầu, Tây Ninh",
        principal: "Trần Văn Minh",
        established: 1995,
        students: 845,
        teachers: 46,
        staff: 12,
        classes: 25,
        attendance: 98.6,
        digital: 96,
        pending: 8,
        rooms: 30,
        computers: 65,
        smartRooms: 20,
        facilities: [
            "Thư viện",
            "Phòng tin học",
            "Nhà đa năng",
            "Phòng y tế",
            "Camera an ninh",
        ],
        photo: ClassroomPhoto,
    },
    {
        id: "thcs-nguyen-trai",
        code: "TN-CS-003",
        name: "THCS Nguyễn Trãi",
        level: "THCS",
        area: "Gò Dầu",
        ownership: "Công lập",
        address: "45 đường Nguyễn Trãi, khu phố 3, Gò Dầu, Tây Ninh",
        principal: "Lê Thị Thu Hà",
        established: 1998,
        students: 1120,
        teachers: 62,
        staff: 14,
        classes: 28,
        attendance: 97.8,
        digital: 88,
        pending: 12,
        rooms: 35,
        computers: 90,
        smartRooms: 16,
        facilities: [
            "Thư viện",
            "Phòng thí nghiệm",
            "Phòng tin học",
            "Sân thể thao",
            "Phòng y tế",
        ],
        photo: CampusPhoto,
    },
    {
        id: "thpt-quang-trung",
        code: "TN-PT-004",
        name: "THPT Quang Trung",
        level: "THPT",
        area: "Tây Ninh",
        ownership: "Công lập",
        address: "86 đường Quang Trung, Tây Ninh",
        principal: "Phạm Quốc Huy",
        established: 1989,
        students: 1480,
        teachers: 85,
        staff: 18,
        classes: 37,
        attendance: 99.1,
        digital: 98,
        pending: 4,
        rooms: 45,
        computers: 140,
        smartRooms: 32,
        facilities: [
            "Thư viện số",
            "Phòng STEM",
            "Phòng thí nghiệm",
            "Nhà đa năng",
            "Phòng tin học",
        ],
        photo: BuildingPhoto,
    },
    {
        id: "mn-anh-duong",
        code: "TN-MN-005",
        name: "Mầm non Ánh Dương",
        level: "Mầm non",
        area: "Trảng Bàng",
        ownership: "Tư thục",
        address: "19 đường Ánh Dương, Trảng Bàng, Tây Ninh",
        principal: "Võ Thị Ngọc Anh",
        established: 2015,
        students: 210,
        teachers: 22,
        staff: 8,
        classes: 9,
        attendance: 96.5,
        digital: 78,
        pending: 6,
        rooms: 12,
        computers: 12,
        smartRooms: 4,
        facilities: [
            "Sân chơi",
            "Bếp ăn một chiều",
            "Phòng âm nhạc",
            "Camera an ninh",
        ],
        photo: ClassroomPhoto,
    },
    {
        id: "th-le-van-tam",
        code: "TN-TH-006",
        name: "Tiểu học Lê Văn Tám",
        level: "Tiểu học",
        area: "Hòa Thành",
        ownership: "Công lập",
        address: "32 đường Lê Văn Tám, Hòa Thành, Tây Ninh",
        principal: "Đặng Thị Thanh",
        established: 2001,
        students: 680,
        teachers: 39,
        staff: 10,
        classes: 20,
        attendance: 98.2,
        digital: 85,
        pending: 7,
        rooms: 24,
        computers: 48,
        smartRooms: 12,
        facilities: ["Thư viện", "Phòng tin học", "Sân thể thao", "Phòng y tế"],
        photo: CampusPhoto,
    },
    {
        id: "thcs-trang-bang",
        code: "TN-CS-007",
        name: "THCS Trảng Bàng",
        level: "THCS",
        area: "Trảng Bàng",
        ownership: "Công lập",
        address: "61 đường Gia Long, Trảng Bàng, Tây Ninh",
        principal: "Nguyễn Đức Thành",
        established: 1992,
        students: 960,
        teachers: 54,
        staff: 13,
        classes: 24,
        attendance: 96.9,
        digital: 72,
        pending: 15,
        rooms: 29,
        computers: 60,
        smartRooms: 10,
        facilities: [
            "Thư viện",
            "Phòng thí nghiệm",
            "Phòng tin học",
            "Sân thể thao",
        ],
        photo: BuildingPhoto,
    },
    {
        id: "thpt-tri-thuc",
        code: "TN-PT-008",
        name: "THPT Trí Thức",
        level: "THPT",
        area: "Tây Ninh",
        ownership: "Tư thục",
        address: "108 đường Tri Thức, Tây Ninh",
        principal: "Bùi Hoàng Nam",
        established: 2012,
        students: 540,
        teachers: 42,
        staff: 11,
        classes: 18,
        attendance: 98.8,
        digital: 94,
        pending: 2,
        rooms: 26,
        computers: 85,
        smartRooms: 18,
        facilities: [
            "Thư viện số",
            "Phòng STEM",
            "Phòng ngoại ngữ",
            "Nhà đa năng",
            "Camera an ninh",
        ],
        photo: ClassroomPhoto,
    },
];

export const number = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value);
export const percent = (value: number) =>
    `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
export const normalize = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
export const status = (school: School) =>
    school.digital >= 85 ? "Vận hành tốt" : "Cần cải thiện";
