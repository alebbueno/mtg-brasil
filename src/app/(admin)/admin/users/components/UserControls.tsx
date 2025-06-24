'use client';

import UserSearch from './UserSearch';
import UserPagination from './UserPagination';

interface UserControlsProps {
  initialQuery: string;
  totalPages: number;
}

export default function UserControls({ initialQuery, totalPages }: UserControlsProps) {
  return (
    <>
      <UserSearch initialQuery={initialQuery} />
      <UserPagination totalPages={totalPages} />
    </>
  );
}
