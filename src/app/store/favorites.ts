import { create } from 'zustand';

type Favorite = {
  id: string;
  name: string;
  image: string;
};

type State = {
  favorites: Favorite[];
  addFavorite: (card: Favorite) => void;
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
