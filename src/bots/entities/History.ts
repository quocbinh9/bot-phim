import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("app_messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true
  })
  messageId: number;

  @Column({
    type: 'json',
    nullable: true
  })
  from: Record<string, any>;

  @Column({
    nullable: true
  })
  chatId: number;

  @Column({
    type: 'json',
    nullable: true
  })
  chat: Record<string, any>;

  @Column({
    nullable: true
  })
  date: string;

  @Column({
    type: "text",
    nullable: true,
  })
  text: string;

  @Column({
    type: "json",
    nullable: true,
  })
  reply_markup: string;


  @Column({
    type: 'json',
    nullable: true
  })
  data: Record<string, any>;

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

  @UpdateDateColumn({
    type: "timestamp",
    nullable: true
  })
  public deletedAt: Date;
}
