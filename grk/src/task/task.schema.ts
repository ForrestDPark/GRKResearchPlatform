import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { HydratedDocument } from 'mongoose';
// mongodb document type 
import { Document } from "mongoose";

export type TaskDocument = HydratedDocument<Task>;


// export type TaskDocument = Task & Document

@Schema()
export class Task {
    @Prop()
    id : string
    @Prop()
    projectId : string
    @Prop()
    title : string
    @Prop()
    desc: string
    @Prop()
    assigned_to: string
    @Prop()
    status : number
    @Prop()
    dueDt: Date
    @Prop()
    createdDt: Date
    @Prop()
    priority: number
    @Prop()
    signedBy : string

}
// 스키마 생성
export const TaskSchema = SchemaFactory.createForClass(Task)