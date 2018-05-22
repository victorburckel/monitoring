export interface MonitoringDocument {
    _id: string;
    _parentDocumentIds: string[];
    type: string;
    submitted: Date;
    ended: Date;
    status: string;
    duration: number;
}

export interface WebServiceDocument extends MonitoringDocument {
    operation: string;
    client_application: string;
    client_hostname: string;
    service: string;
    input_size: number;
    output_size: number;
    error?: string;
    after_send_error?: string;
}

export interface PricingDocument extends MonitoringDocument {
    pricer: string;
    taskId: number;
    sessionId: number;
}
