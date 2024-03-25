import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Episode } from "./Episode";
import { Category } from "./Category";
import { Director } from "./Director";
import { Region } from "./Region";
import { Studio } from "./Studio";
import { Tag } from "./Tag";
import { Actor } from "./Actor";

export type TypeMovieType = "single" | "series";

export type StatusType = "trailer" | "ongoing" | "completed";

@Entity("app_movies")
export class Movie {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  originName: string;

  @Column({
    type: "text",
    nullable: true,
  })
  content: string;

  @Column({
    type: "text",
    nullable: true,
  })
  thumbUrl: string;

  @Column({
    type: "text",
    nullable: true,
  })
  posterUrl: string;

  @Column({
    type: "text",
    nullable: true,
  })
  originalPosterUrl: string;

  @Column({
    type: "enum",
    enum: ["single", "series"],
    default: "single",
    nullable: true,
  })
  type: TypeMovieType;

  @Column({
    type: "enum",
    enum: ["trailer", "ongoing", "completed"],
    default: "trailer",
    nullable: true,
  })
  status: StatusType;

  @Column({
    type: "text",
    nullable: true,
  })
  trailerUrl: string;

  @Column({
    type: "text",
    nullable: true,
  })
  episodeTime: string;

  @Column({
    type: "text",
    nullable: true,
  })
  episodeCurrent: string;

  @Column({
    type: "text",
    nullable: true,
  })
  episodeTotal: string;

  @Column({
    nullable: true,
    default: "HD",
  })
  quality: string;

  @Column({
    nullable: true,
    default: "Vietsub",
  })
  language: string;

  @Column({
    nullable: true,
  })
  notify: string;

  @Column({
    nullable: true,
  })
  showtimes: string;

  @Column({
    nullable: true,
  })
  publishYear: string;

  @Column({
    type: "boolean",
    default: false,
  })
  isShownInTheater: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  isRecommended: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  isCopyright: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  isSensitiveContent: boolean;

  @Column({
    type: "integer",
    default: 0,
  })
  episodeServerCount: number;

  @Column({
    type: "integer",
    default: 0,
  })
  episodeDataCount: number;

  @Column({
    nullable: true,
  })
  updateHandler: string;

  @Column({
    nullable: true,
  })
  updateIdentity: string;

  @Column({
    type: "text",
    nullable: true,
  })
  crapterUrl: string;

  @Column({
    nullable: true,
  })
  updateChecksum: string;


  @Column({
    nullable: true,
  })
  source: string;

  @OneToMany(() => Episode, (episode) => episode.movie)
  episodes: Episode[];

  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Actor)
  @JoinTable()
  actors: Actor[];

  @ManyToMany(() => Director)
  @JoinTable()
  directors: Director[];

  @ManyToMany(() => Region)
  @JoinTable()
  regions: Region[];

  @ManyToMany(() => Studio)
  @JoinTable()
  studios: Studio[];

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];

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
