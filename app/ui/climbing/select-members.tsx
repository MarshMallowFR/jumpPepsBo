import React, { useState } from 'react';
import { Checkbox } from '../common/checkbox';

interface SelectMembersProps {
  id: string;
  isSelected: boolean;
  setIsSelected: (isSelected: boolean) => void;
}

export default function SelectMembers({
  id,
  isSelected,
  setIsSelected,
}: SelectMembersProps) {
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
