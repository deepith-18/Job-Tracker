import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InterviewCodeQuestion } from '../types';
import { auth } from '../firebase/config';
import {
  addCodeQuestionItem,
  updateCodeQuestionItem,
  deleteCodeQuestionItem,
} from '../firebase/firestore';

export interface CodeVaultStore {
  questions: InterviewCodeQuestion[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setQuestions: (questions: InterviewCodeQuestion[]) => void;
  addQuestion: (q: Omit<InterviewCodeQuestion, 'id' | 'dateAdded'>) => Promise<string>;
  updateQuestion: (id: string, updates: Partial<InterviewCodeQuestion>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  resetToDefaults: () => void;
}

export const INITIAL_CODE_QUESTIONS: InterviewCodeQuestion[] = [
  {
    id: 'seed-lru-cache',
    title: 'Design LRU Cache (Least Recently Used)',
    company: 'Google',
    round: 'Technical Round 2',
    difficulty: 'Medium',
    topic: 'Data Structures & Design',
    language: 'python',
    timeComplexity: 'O(1) get & put',
    spaceComplexity: 'O(capacity)',
    approach:
      'Combine a Hash Map with a Doubly Linked List. The hash map maps keys to nodes for O(1) lookup, while the DLL maintains usage order. When accessing or updating a node, remove and append to the head. Evict from the tail when capacity is exceeded.',
    followUps:
      'Interviewer asked: How would you make this thread-safe? (Read-write lock on the map and DLL operations, or sharded lock striping).',
    isStarred: true,
    dateAdded: '2026-03-01',
    code: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}  # key -> Node
        # Dummy head & tail
        self.head, self.tail = Node(), Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node):
        p, n = node.prev, node.next
        p.next, n.prev = n, p

    def _add_to_front(self, node: Node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_front(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._add_to_front(node)
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]`,
  },
  {
    id: 'seed-promise-all',
    title: 'Implement Promise.all With Concurrency Limiter',
    company: 'Stripe',
    round: 'Frontend & Architecture Round',
    difficulty: 'Medium',
    topic: 'Async & Concurrency',
    language: 'typescript',
    timeComplexity: 'O(N) operations',
    spaceComplexity: 'O(N) results array',
    approach:
      'Track resolved count against array length. Execute tasks up to the concurrency limit. As each promise resolves, store in its corresponding original index and spawn the next task from the queue. If any reject, reject the outer promise immediately.',
    followUps:
      'Asked: How do you handle non-promise values passed into the array? Wrap them with Promise.resolve().',
    isStarred: true,
    dateAdded: '2026-03-02',
    code: `export function promisePool<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = new Array(tasks.length);
    let executing = 0;
    let index = 0;
    let completed = 0;

    if (tasks.length === 0) {
      return resolve([]);
    }

    function runNext() {
      while (executing < concurrency && index < tasks.length) {
        const currentIndex = index++;
        executing++;

        tasks[currentIndex]()
          .then((res) => {
            results[currentIndex] = res;
            completed++;
            executing--;

            if (completed === tasks.length) {
              resolve(results);
            } else {
              runNext();
            }
          })
          .catch(reject);
      }
    }

    runNext();
  });
}`,
  },
  {
    id: 'seed-subarray-sum',
    title: 'Subarray Sum Equals K (Prefix Sum + Hash Map)',
    company: 'Meta',
    round: 'Coding Round 1',
    difficulty: 'Medium',
    topic: 'Arrays & Prefix Sum',
    language: 'cpp',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    approach:
      'Use a prefix sum with an unordered_map to store frequencies of prefix sums. If (current_sum - k) was seen before, add its count to the answer. Initialize map with {0: 1} to account for subarrays starting at index 0.',
    followUps:
      'Asked: What if numbers can be negative? Prefix sum handles negatives seamlessly. What if you needed the maximum length subarray instead? Store first seen indices instead of frequency counts.',
    isStarred: false,
    dateAdded: '2026-03-03',
    code: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> prefixFreq;
        prefixFreq[0] = 1; // base case for sum == k
        
        int currentSum = 0;
        int count = 0;
        
        for (int num : nums) {
            currentSum += num;
            int target = currentSum - k;
            
            if (prefixFreq.find(target) != prefixFreq.end()) {
                count += prefixFreq[target];
            }
            
            prefixFreq[currentSum]++;
        }
        
        return count;
    }
};`,
  },
  {
    id: 'seed-token-bucket',
    title: 'Token Bucket Rate Limiter',
    company: 'Uber',
    round: 'System & Distributed Systems',
    difficulty: 'Hard',
    topic: 'System Design & Concurrency',
    language: 'go',
    timeComplexity: 'O(1) allow check',
    spaceComplexity: 'O(1) per client',
    approach:
      'Store capacity, refill rate per second, current tokens, and lastRefillTime. Upon an incoming request, calculate elapsed time, replenish tokens clamped to capacity, update lastRefillTime, and decrement if tokens >= 1.',
    followUps:
      'Asked: How do you scale this across 100 API gateway instances? Use Redis with Lua script for atomic token calculation, or sliding window logs in memory with local caches.',
    isStarred: true,
    dateAdded: '2026-03-04',
    code: `package ratelimiter

import (
	"sync"
	"time"
)

type TokenBucket struct {
	mu           sync.Mutex
	capacity     float64
	tokens       float64
	refillRate   float64 // tokens per second
	lastRefill   time.Time
}

func NewTokenBucket(capacity, refillRate float64) *TokenBucket {
	return &TokenBucket{
		capacity:   capacity,
		tokens:     capacity,
		refillRate: refillRate,
		lastRefill: time.Now(),
	}
}

func (tb *TokenBucket) Allow() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()
	tb.lastRefill = now

	// Replenish tokens based on elapsed time
	tb.tokens += elapsed * tb.refillRate
	if tb.tokens > tb.capacity {
		tb.tokens = tb.capacity
	}

	if tb.tokens >= 1.0 {
		tb.tokens -= 1.0
		return true
	}

	return false
}`,
  },
  {
    id: 'seed-top-salaries-sql',
    title: 'Top 3 Salaries Per Department (DENSE_RANK)',
    company: 'Amazon',
    round: 'Data & SQL Assessment',
    difficulty: 'Medium',
    topic: 'SQL & Database',
    language: 'sql',
    timeComplexity: 'O(N log N) sorting partitions',
    spaceComplexity: 'O(N) window buffer',
    approach:
      'Use the DENSE_RANK() window function partitioned by department_id and ordered by salary DESC to handle ties without skipping ranks. Wrap in a Common Table Expression (CTE) and filter where rank <= 3.',
    followUps:
      'Interviewer asked difference between ROW_NUMBER, RANK, and DENSE_RANK when two employees have the identical salary.',
    isStarred: false,
    dateAdded: '2026-03-04',
    code: `WITH RankedSalaries AS (
    SELECT 
        d.name AS department,
        e.name AS employee,
        e.salary,
        DENSE_RANK() OVER (
            PARTITION BY e.department_id 
            ORDER BY e.salary DESC
        ) AS salary_rank
    FROM Employee e
    JOIN Department d ON e.department_id = d.id
)
SELECT 
    department,
    employee,
    salary
FROM RankedSalaries
WHERE salary_rank <= 3
ORDER BY department, salary DESC;`,
  },
];

export const useCodeVaultStore = create<CodeVaultStore>()(
  persist(
    (set) => ({
      questions: [],
      loading: false,

      setLoading: (loading) => set({ loading }),

      setQuestions: (questions) => set({ questions, loading: false }),

      addQuestion: async (q) => {
        const newDate = new Date().toISOString().split('T')[0];
        const tempId = `code-q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const optimisticQuestion: InterviewCodeQuestion = {
          ...q,
          id: tempId,
          dateAdded: newDate,
        };

        // Optimistic UI update
        set((state) => ({
          questions: [optimisticQuestion, ...state.questions],
        }));

        // Persist to Firestore if user is authenticated
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            const firestoreId = await addCodeQuestionItem(currentUser.uid, {
              ...q,
              dateAdded: newDate,
            });
            // Update temporary ID with actual Firestore ID
            set((state) => ({
              questions: state.questions.map((item) =>
                item.id === tempId ? { ...item, id: firestoreId } : item
              ),
            }));
            return firestoreId;
          } catch (err) {
            console.error('Failed to sync code question to Firestore:', err);
          }
        }
        return tempId;
      },

      updateQuestion: async (id, updates) => {
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }));

        const currentUser = auth.currentUser;
        if (currentUser && !id.startsWith('seed-')) {
          try {
            await updateCodeQuestionItem(id, updates);
          } catch (err) {
            console.error('Failed to update code question in Firestore:', err);
          }
        }
      },

      deleteQuestion: async (id) => {
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id),
        }));

        const currentUser = auth.currentUser;
        if (currentUser && !id.startsWith('seed-')) {
          try {
            await deleteCodeQuestionItem(id);
          } catch (err) {
            console.error('Failed to delete code question from Firestore:', err);
          }
        }
      },

      toggleStar: async (id) => {
        let targetStarred = false;
        set((state) => ({
          questions: state.questions.map((q) => {
            if (q.id === id) {
              targetStarred = !q.isStarred;
              return { ...q, isStarred: targetStarred };
            }
            return q;
          }),
        }));

        const currentUser = auth.currentUser;
        if (currentUser && !id.startsWith('seed-')) {
          try {
            await updateCodeQuestionItem(id, { isStarred: targetStarred });
          } catch (err) {
            console.error('Failed to toggle star in Firestore:', err);
          }
        }
      },

      resetToDefaults: () =>
        set({
          questions: [],
        }),
    }),
    {
      name: 'joborbit_code_questions_vault',
    }
  )
);
