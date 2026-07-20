export interface ProductData {
  id: string;
  name: string;
  type: string;
}

export class Product implements ProductData {
  readonly id: string;
  readonly name: string;
  readonly type: string;

  constructor({ id, name, type }: ProductData) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}
