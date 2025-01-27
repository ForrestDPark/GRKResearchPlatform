
export interface TaskDto {
    id : string
    projectId : string
    title : string
    desc: string
    assigned_to: string
    status : number
    dueDt: Date
    createdDt: Date
    priority: number
    signedBy : string
}