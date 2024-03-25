import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type ActorGenderType = "male" | "female" | "other";

@Entity("app_members")
export class Member {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column({
    nullable: true
  })
  lastName: string;

  @Column()
  chatId: number;

  @Column()
  languageCode: string;

  @Column({
    type: 'boolean'
  })
  isBot: boolean;

  @Column({
    type: "enum",
    enum: ["male", "female", "other"],
    default: "other",
    nullable: true,
  })
  gender: ActorGenderType;

  @Column({
    type: "text",
    nullable: true,
  })
  bio: string;

  @Column({
    type: "text",
    nullable: true,
  })
  thumbUrl: string;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  public updatedAt: Date;
}
