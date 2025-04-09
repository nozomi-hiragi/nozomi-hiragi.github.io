export type Account = {
  label: string;
  icon: string;
  gradient: { from: string; to: string; deg: number };
  url: string;
};

export type Framework = {
  name: string;
  rate: number;
};

export type Language = {
  name: string;
  rate: number;
};

type ProductLink = {
  label: string;
  url: string;
  color?: string;
};

export type Product = {
  name: string;
  description: string;
  status: string;
  note: string;
  tags?: string[];
  links?: ProductLink[];
};

export type Colors = {
  status: {
    [key: string]: string;
  },
  tags: {
    [key: string]: {
      text: string;
      background: string;
    };
  }
}