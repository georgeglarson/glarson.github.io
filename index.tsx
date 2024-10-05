import { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

const ChecklistItem = ({ item, isChecked, onToggle }) => (
  <div
    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${
      isChecked ? 'bg-gray-800 text-gray-400' : 'bg-gray-700 text-white'
    } hover:bg-gray-600`}
    onClick={onToggle}
  >
    {isChecked ? (
      <CheckSquare className="w-6 h-6 mr-3 text-green-500" />
    ) : (
      <Square className="w-6 h-6 mr-3 text-gray-400" />
    )}
    <span className={isChecked ? 'line-through' : ''}>{item}</span>
  </div>
);

export default function Home() {
  const initialItems = [
    'birthday cards',
    'cake',
    'piece of silver',
    'raspberries',
    'small backpack',
    'sammiches?',
    'RXs',
  ];

  const [checkedItems, setCheckedItems] = useState(
    new Array(initialItems.length).fill(false)
  );

  const handleToggle = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {initialItems.map((item, index) => (
          <ChecklistItem
            key={index}
            item={item}
            isChecked={checkedItems[index]}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </div>
  );
}