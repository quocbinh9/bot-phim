import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type DirectorGenderType = "male" | "female" | "other";

@Entity("app_directors")
export class Director {
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
  gender: DirectorGenderType;

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
