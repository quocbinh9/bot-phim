import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Movie } from "./Movie";

export type DirectorGenderType = "male" | "female" | "other";

@Entity("app_episodes")
export class Episode {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  serverName: string;

  @Column({
    nullable: true
  })
  serverType: string;

  @Column({
    nullable: true
  })
  originalUrl: string;

  @Column()
  name: string;

  @Column()
  displayName: string;

  @Column()
  type: string;

  @Column()
  link: string;

  @Column({
    type: 'integer',
    default: 1
  })
  order: number;

  @Column({
    type: 'json',
    nullable: true
  })
  rawData: string

  @ManyToOne(() => Movie, (movie) => movie.episodes)
  movie: Record<any, any>

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
