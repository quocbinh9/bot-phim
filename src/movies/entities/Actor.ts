import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type ActorGenderType = "male" | "female" | "other";

@Entity("app_actors")
export class Actor {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

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
