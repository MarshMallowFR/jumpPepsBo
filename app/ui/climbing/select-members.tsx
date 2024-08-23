'use client';

import React, { useState } from 'react';
import { Checkbox } from '../common/checkbox';

interface SelectMembersProps {
  id: string;
}

export default function SelectMembers({ id }: SelectMembersProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelected(e.target.checked);
  };

  return (
    <Checkbox
      defaultValue={isSelected}
      handleChange={handleCheckboxChange}
      idFor={id}
    />
  );
}
