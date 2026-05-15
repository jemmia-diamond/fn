export interface LarksuiteSalePerson {
    avatar_url: string;
    email: string;
    en_name: string;
    id: string;
    name: string;
}

export interface LarksuiteAttachment {
    file_token: string;
    name: string;
    size: number;
    tmp_url: string;
    type: string;
    url: string;
}

export interface LarksuiteAppointmentRawFields {
    "Chính sách thu mua thu đổi"?: string | null;
    "Cửa hàng"?: string[];
    "Giới tính"?: string;
    "Hình ảnh sản phẩm (nếu có)"?: LarksuiteAttachment[];
    "Lưu ý đặc biệt"?: string;
    "Nguồn"?: string | null;
    "Ngày khách dự kiến tới CH"?: number;
    "Năm"?: number;
    "Nội dung đón tiếp tại cửa hàng"?: string;
    "Offlie Phản hồi"?: string | null;
    "Parent items"?: any[];
    "Sale Offline tiếp nhận"?: LarksuiteSalePerson[];
    "Sale chính"?: LarksuiteSalePerson[];
    "Số điện thoại"?: string | null;
    "Tháng"?: number;
    "Trạng thái đơn hàng"?: string;
    "Tên khách hàng/ facebook"?: string;
    "created_at"?: number;
    "updated_at"?: number;
}

export interface LarksuiteAppointmentParsedFields {
    store: string;
    name: string;
    phone_number: string;
    gender: string;
    product_images: LarksuiteAttachment[] | null;
    note: string | null;
    date_time: Date | null;
    conversation_greeting: string | null;
    customer_response: string | null;
    main_sales: LarksuiteSalePerson[] | null;
    offline_sales: LarksuiteSalePerson[] | null;
    status: string | null;
    policy: string | null;
}

export interface ILarksuiteAppointment extends LarksuiteAppointmentParsedFields {
    record_id: string;
}

export interface IFrappeLead {
    name: string;
    first_name: string;
    budget_lead: string;
    proposed_budget: string;
    phone: string;
    email_id: string | null;
}

export interface IFrappeSalesPerson {
    name: string;
    sales_person_name: string;
    employee_email: string;
}

export interface IFrapperAttachment {
    file_name: string
    file_url: string;
    is_private: number;
    name: string;
}
