import { create } from 'zustand';

type Favorite = {
  id: string;
  name: string;
  image: string;
};

type State = {
  favorites: Favorite[];
  // eslint-disable-next-line no-unused-vars
  addFavorite: (card: Favorite) => void;
  // eslint-disable-next-line no-unused-vars
  removeFavorite: (id: string) => void;
};

export const useFavorites = create<State>((set) => ({
  favorites: [],
  addFavorite: (card) =>
    set((state) => ({
      favorites: [...state.favorites, card],
    })),
  removeFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.filter((c) => c.id !== id),
    })),
}));
