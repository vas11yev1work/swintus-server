import _ from 'lodash';

const COLORS = ['GREEN', 'RED', 'YELLOW', 'BLUE'];
const VALUES = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  'HLOPCOPYT',
  'HAPEZH',
  'ZAHRAPIN',
  'PEREHRYK',
  'POLYSVIN',
];

export const generateCards = () =>
  _.shuffle(
    VALUES.map(value => {
      const currentCards: string[] = [];
      if (value === 'POLYSVIN') {
        currentCards.push(
          'POLYSVIN_NONE',
          'POLYSVIN_NONE',
          'POLYSVIN_NONE',
          'POLYSVIN_NONE'
        );
      } else {
        for (const color of COLORS) {
          currentCards.push(`${value}_${color}`);
        }
      }
      return currentCards;
    })
      .flat()
      .reduce<string[]>((res, current) => {
        return res.concat([current, current]);
      }, [])
  ) as string[];
