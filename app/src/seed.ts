import { State, Topic } from './types';
import { TOPIC_COLORS as C } from './palette';

const topic = (
  id: string, section: Topic['section'], name: string, color: string, goal: string,
  src: Topic['src'], byAuthor = false,
): Topic => ({ id, section, name, color, goal, items: [], src, byAuthor });

// Only the starting list of topics. Their content (articles, books, quotes, news) is fetched online.
export function seed(): State {
  return {
    settings: { theme: 'auto', limitMin: 180, messagesOnly: true },
    notes: [],
    progress: {},
    topics: [
      topic('krishnamurti', 'lib', 'J. Krishnamurti', C[0], 'Understand attention, conditioning and freedom from the known.',
        { wiki: 'Jiddu Krishnamurti', books: 'Jiddu Krishnamurti', news: '"Jiddu Krishnamurti"' }, true),
      topic('osho', 'lib', 'Osho', C[1], 'Explore awareness, meditation and living without guilt.',
        { wiki: 'Osho', books: 'Osho', news: '"Osho" teachings' }, true),
      topic('kafka', 'lib', 'Franz Kafka', C[2], 'Read the major stories and understand the themes of guilt and bureaucracy.',
        { wiki: 'Franz Kafka', books: 'Franz Kafka', news: '"Franz Kafka"' }, true),
      topic('camus', 'lib', 'Albert Camus', C[3], 'Understand the absurd and how to live well anyway.',
        { wiki: 'Albert Camus', books: 'Albert Camus', news: '"Albert Camus"' }, true),
      topic('sales', 'up', 'Sales', C[4], 'Run better discovery calls and close with confidence.',
        { wiki: 'Sales', books: 'sales techniques', news: 'sales case study' }),
      topic('marketing', 'up', 'Marketing', C[5], 'Learn how products grow through content, referrals and positioning.',
        { wiki: 'Marketing', books: 'marketing strategy', news: 'marketing case study' }),
      topic('cases', 'up', 'Case studies', C[1], 'Collect growth stories and the lessons behind them.',
        { wiki: 'Case study', books: 'business case studies', news: 'business growth case study' }),
    ],
  };
}
