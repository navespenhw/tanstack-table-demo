import {faker} from "@faker-js/faker";
import type {SortDirection} from "@tanstack/react-table";
import type {AriaAttributes} from "react";

export function ariaSort(isSorted: false | SortDirection) {
  const translate: { [d in SortDirection]: AriaAttributes["aria-sort"] } = {
    asc: "ascending",
    desc: "descending",
  };
  return isSorted ? translate[isSorted] : "none";
}

export type Pet = {
  name: string,
  type: string,
  breed: string | undefined,
  age: number,
  amountRaised: number | undefined,
}
const breedGenerator: { [k: string]: () => string } = {
  bird: faker.animal.bird,
  cat: faker.animal.cat,
  dog: faker.animal.dog,
  fish: faker.animal.fish,
}

function newPet(): Pet {
  const type = faker.animal.type();
  return {
    name: faker.animal.petName(),
    type: type,
    breed: breedGenerator[type]?.(),
    age: faker.number.int({min: 1, max: 23}),
    amountRaised: faker.helpers.maybe(() => faker.number.float({
      fractionDigits: 2,
      max: 10000,
    }))
  }
}

export function makeData(length: number): Pet[] {
  return Array.from({length}, newPet)
}

export function titleCase(string?: string) {
  if (string) {
    return (
      string.charAt(0).toLocaleUpperCase() + string.slice(1).toLocaleLowerCase()
    );
  } else {
    return "";
  }
}

const moneyFormat = new Intl.NumberFormat("nb-NO", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function amountFormat(belop: number | undefined) {
  return belop ? moneyFormat.format(belop) : undefined;
}
