// src/tests/components/profile/pet-container.test.js
import React from 'react';
import { render } from '@testing-library/react';
import { PetsContainer } from '@/components/profile/pet-container';
import { CreatePetProfile } from '@/components/profile/create-pet-profile';
import { PetSnippetCard } from '@/components/PetSnippetCard';

jest.mock('@/components/profile/create-pet-profile', () => ({
  CreatePetProfile: jest.fn(() => <div data-testid="create-pet-profile" />),
}));

jest.mock('@/components/PetSnippetCard', () => ({
  PetSnippetCard: jest.fn(() => <div data-testid="pet-snippet-card" />),
}));

describe('PetsContainer', () => {
  const props = {
    uid: '123',
    username: 'testuser',
    displayName: 'Test User',
    location: 'Test Location',
    userPhotoURL: 'https://example.com/user.jpg',
    coverPhotoURL: 'https://example.com/cover.jpg',
    pets: [
      {
        petName: 'Fluffy',
        petBreed: 'Cat',
        petPhotoURL: 'https://example.com/pet1.jpg',
        petID: '1',
      },
      {
        petName: 'Buddy',
        petBreed: 'Dog',
        petPhotoURL: 'https://example.com/pet2.jpg',
        petID: '2',
      },
    ],
  };

    it('renders the component correctly', () => {
    const { getByTestId, getAllByTestId } = render(<PetsContainer props={props} />);

    // Check if the CreatePetProfile component is rendered
    expect(getByTestId('create-pet-profile')).toBeInTheDocument();

    // Check if the PetSnippetCard components are rendered
    const petCards = getAllByTestId('pet-snippet-card');
    expect(petCards).toHaveLength(2);
    });
});