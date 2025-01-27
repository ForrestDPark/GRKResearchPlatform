// status 
/*
1 : ontrack
2 : complete
3 : delayed
4 : approved
*/
// export interface ProjectDto{}

export interface ProjectDto {
    id : string
    title : string
    desc : string
    createdBy: string
    updateBy?: string
    status? : number
    createdDt : Date
    updatedDt? : Date 
}