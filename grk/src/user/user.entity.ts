import { Column, Entity, PrimaryGeneratedColumn} from 'typeorm'


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id? : number

    @Column({ unique: true})
    email : string 

    @Column( {nullable: true}) // google 인증시 패스워드에 빈값 허용 
    password: string

    @Column()
    username: string

    @Column({ default: 'user' })
    role: string

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP"})
    createdDt: Date= new Date()

    // provider ID : 구글 로그인이 아닌경우 빈값  
    @Column({ nullable : true})
    providerId : string
}