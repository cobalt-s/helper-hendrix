// This file is part of the Hendrix Chrome Extension.

// pokeTrack.js

import { getMyPokemon as loadFromStorage } from "./storage.js";

// ArrayList of Pokemon
// This is a list of Pokemon with their names, images, owned status, and prices
// This will be temporarily stored in the extension
// until we can get a backend set up with all pokemon data
const pokeList = [
  {
    name: "Bulbasaur",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    owned: false,
    price: 15,
  },
  {
    name: "Charmander",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
    owned: false,
    price: 15,
  },
  {
    name: "Squirtle",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
    owned: false,
    price: 15,
  },
  {
    name: "Chikorita",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png",
    owned: false,
    price: 15,
  },
  {
    name: "Cyndaquil",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/155.png",
    owned: false,
    price: 15,
  },
  {
    name: "Totodile",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/158.png",
    owned: false,
    price: 15,
  },
  {
    name: "Treecko",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png",
    owned: false,
    price: 15,
  },
  {
    name: "Torchic",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/255.png",
    owned: false,
    price: 15,
  },
  {
    name: "Mudkip",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/258.png",
    owned: false,
    price: 15,
  },
  {
    name: "Turtwig",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/387.png",
    owned: false,
    price: 15,
  },
  {
    name: "Chimchar",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/390.png",
    owned: false,
    price: 15,
  },
  {
    name: "Piplup",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/393.png",
    owned: false,
    price: 15,
  },
  {
    name: "Snivy",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/495.png",
    owned: false,
    price: 15,
  },
  {
    name: "Tepig",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/498.png",
    owned: false,
    price: 15,
  },
  {
    name: "Oshawott",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/501.png",
    owned: false,
    price: 15,
  },
  {
    name: "Chespin",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/650.png",
    owned: false,
    price: 15,
  },
  {
    name: "Fennekin",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/653.png",
    owned: false,
    price: 15,
  },
  {
    name: "Froakie",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/656.png",
    owned: false,
    price: 15,
  },
  {
    name: "Rowlet",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/722.png",
    owned: false,
    price: 15,
  },
  {
    name: "Litten",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/725.png",
    owned: false,
    price: 15,
  },
  {
    name: "Popplio",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/728.png",
    owned: false,
    price: 15,
  },
  {
    name: "Grookey",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/810.png",
    owned: false,
    price: 15,
  },
  {
    name: "Scorbunny",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/813.png",
    owned: false,
    price: 15,
  },
  {
    name: "Sobble",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/816.png",
    owned: false,
    price: 15,
  },
  {
    name: "Sprigatito",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/906.png",
    owned: false,
    price: 15,
  },
  {
    name: "Fuecoco",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/909.png",
    owned: false,
    price: 15,
  },
  {
    name: "Quaxly",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/912.png",
    owned: false,
    price: 15,
  },
  {
    name: "Pikachu",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    owned: false,
    price: 15,
  },
  {
    name: "Eevee",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
    owned: false,
    price: 15,
  },
  {
    name: "Mew",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png",
    owned: false,
    price: 100,
  },
];


// advanced Pokemon: Index 29+


// ArrayLists to store Pokemon data
// These arrays will be used to store the Pokemon owned by the user and the Pokemon in the store
const myPokemon = []; // array to store the Pokemon owned by the user
const storePokemon = []; // array to store the Pokemon in the store

export function getRandomPokemon() {
  return pokeList[Math.floor(Math.random() * pokeList.length)];
}

export function addPokemonToStore(p) {
  if (!p.owned && !storePokemon.find(x => x.name === p.name)) {
    storePokemon.push(p);
  }
}

export function setStore() {
  storePokemon.length = 0;
  for (let i = 0; i < 6; i++) {
    addPokemonToStore(getRandomPokemon());
  }
}

export async function getMyPokemon() {
  if (myPokemon.length === 0) {
    const stored = await loadFromStorage();
    myPokemon.push(...stored);
  }
  return myPokemon;
}

export function buyPokemon(pokemon) {
  const idx = storePokemon.findIndex(x => x.name === pokemon.name);
  if (idx !== -1) {
    storePokemon.splice(idx, 1);
    pokemon.owned = true;
    myPokemon.push(pokemon);
  }
}

export { storePokemon };