export interface MonitoringDocument {
    id: string;
    parentDocumentId: string;
    submitted: Date;
    started: Date;
    ended: Date;
    status: string;
    duration: number;
}

export interface WebServiceDocument extends MonitoringDocument {
    operation: string;
    client_application: string;
    client_hostname: string;
    service: string;
}

export interface PricingDocument extends MonitoringDocument {
    pricer: string;
    taskId: number;
    sessionId: number;
}
