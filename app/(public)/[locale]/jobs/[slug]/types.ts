export type JobDetailRecord = {
  id: string;
  title: string;
  slug: string;
  salaryText: string;
  benefits: unknown;
  descriptionRich: unknown;
  publishAt: Date | null;
  updatedAt: Date;
  prefecture: {
    nameJP: string | null;
    nameVN: string;
    code: string;
  };
  heroImage: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;
};
