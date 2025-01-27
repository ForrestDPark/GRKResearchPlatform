import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// mongodb document type 
import { Document } from "mongoose";

import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;
// export type ProjectDocument = Project & Document

@Schema()
export class Project {
    @Prop()
    id: string
    @Prop()
    title: string
    @Prop()
    desc: string
    @Prop()
    createdBy : string
    @Prop()
    updatedBy : string
    @Prop()
    status : number
    @Prop()
    createdDt: Date
    @Prop()
    updatedDt: Date
}
// 스키마 생성
export const ProjectSchema = SchemaFactory.createForClass(Project)