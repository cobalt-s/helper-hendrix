// storage.js

/** Persist the array of owned Pokémon */
export function storeUserPokemon(pokemonArray) {
  chrome.storage.local.set({ myPokemon: pokemonArray }, () => {
    console.log("✅ myPokemon saved:", pokemonArray);
  });
}

/** Load the persisted array (or empty if none) */
export function loadUserPokemon() {
  return new Promise((resolve) => {
    chrome.storage.local.get("myPokemon", (res) => {
      resolve(res.myPokemon || []);
    });
  });
}

/** Alias for clarity */
export function getMyPokemon() {
  return loadUserPokemon();
}