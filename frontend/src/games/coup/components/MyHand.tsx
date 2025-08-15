export default function MyHand({ cards }: { cards: string[] }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Your Cards</h3>
      <div className="flex gap-2">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="p-3 bg-white text-black rounded shadow min-w-[60px] text-center">
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}
