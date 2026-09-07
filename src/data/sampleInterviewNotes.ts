/**
 * Preloaded high-fidelity Markdown Interview Notes covering multiple rounds,
 * theory & conceptual questions, coding questions, and rejection retrospectives.
 */

export const SAMPLE_GOOGLE_DEBRIEF_MD = `# Google - Senior Full-Stack Software Engineer (L5)
**Company:** Google
**Role:** Senior Full-Stack Software Engineer (L5)
**Status:** Debrief / Rejection Retrospective
**Interview Date:** 2026-02-18

Comprehensive 4-round technical interview debrief at Google. Questions spanned frontend JavaScript/React engine theory, optimal data structures and algorithmic complexity, distributed cache architecture, and engineering leadership.

---

## Round 1: Core Fundamentals & JavaScript / React Theory
**Interviewer:** Staff Frontend Engineer (Chrome / YouTube)
**Round Type:** Technical & Theory Screen
**Round Notes:** Rapid-fire deep dive into browser execution models, React 19 concurrent features, memory leaks, and V8 optimization. Evaluates if the candidate understands the engine under the hood or merely relies on high-level APIs.

### Q1: [Theory] How does the React Fiber Reconciliation algorithm work and why is it interruptible?
**Category:** React & Frontend
**Key Concepts:** Fiber Architecture, Reconciliation, Time Slicing, RequestIdleCallback, Concurrent Mode
**Difficulty:** Hard
**Answer:**
React Fiber is a complete rewrite of the reconciliation tree where virtual nodes are represented as singly-linked list fiber units of work (child, sibling, return pointers). 

Before Fiber (React 15 stack reconciler), rendering was recursive and synchronous — rendering a large DOM subtree would lock the browser main thread and cause frame drops (>16ms).

Fiber splits rendering into two distinct phases:
1. **Render / Reconciliation Phase (Asynchronous & Interruptible)**: React walks the fiber graph using a \`workLoopConcurrent\`. Each fiber unit can yield execution back to the browser via cooperative scheduling (\`scheduler\` package using \`MessageChannel\` / \`requestIdleCallback\`) if high-priority input events occur. Updates can be prioritized, aborted, or batched.
2. **Commit Phase (Synchronous & Non-Interruptible)**: Once the work tree is computed with mutation tags (Placement, Update, Deletion), React commits all mutations to the real DOM in a single synchronous pass to avoid tearing or visual inconsistencies.

**Mistake Identified:**
Described Virtual DOM as "just an HTML copy that compares diffs" without explaining the Fiber linked-list node pointers (\`child\`, \`sibling\`, \`return\`) or why the commit phase must remain synchronous while the render phase yields.

**What to Learn:**
Study the two-phase execution lifecycle. Master how React's scheduler cooperates with the browser event loop using 5ms time slices.

**Follow-ups:**
- How does React 19 handle automatic batching across async promises?
- Why can't the Commit phase be split or interrupted?

---

### Q2: [Theory] Explain Event Loop Microtasks vs Macrotasks and how Closure memory leaks occur.
**Category:** Core JavaScript & Engine
**Key Concepts:** Microtask Queue, Task Queue, V8 Heap, Closures, Garbage Collection
**Difficulty:** Medium
**Answer:**
The JavaScript runtime executes single-threaded execution on the call stack.
1. **Macrotasks**: Scheduled by \`setTimeout\`, \`setInterval\`, UI events, and I/O. One macrotask is dequeued per loop cycle.
2. **Microtasks**: Scheduled by \`Promise.then\`, \`queueMicrotask\`, and \`MutationObserver\`. **The microtask queue is entirely drained** before the next macrotask is picked, and before browser paint/layout recalculation.

**Closure Memory Leak Mechanism:**
A closure retains references to variables in its outer lexical scope via the \`[[Scopes]]\` internal slot in V8. A common memory leak occurs when a detached DOM node or long-lived event handler holds a reference to an outer function scope containing a massive buffer:

\`\`\`javascript
function attachHandler() {
    const hugeDataset = new Array(1000000).fill("payload");
    // Leak: anonymous callback survives in global event listener,
    // holding outer lexical scope (including hugeDataset) on the heap.
    document.getElementById("submit-btn").addEventListener("click", () => {
        console.log("Button clicked");
    });
}
\`\`\`

**Mistake Identified:**
Confused microtask draining with macrotask scheduling; assumed \`setTimeout(fn, 0)\` runs immediately before unresolved promise chains.

**What to Learn:**
Draw the execution sequence: 1) Synchronous Script -> 2) Drain ALL Microtasks -> 3) Render / Paint -> 4) Dequeue 1 Macrotask.

---

## Round 2: Data Structures & Algorithmic Problem Solving
**Interviewer:** Senior Software Engineer (Google Cloud)
**Round Type:** Technical / DSA
**Round Notes:** Problem solving under strict time constraints. The interviewer was looking for explicit space/time complexity analysis and defensive edge case handling before coding.

### Q3: [Coding] Design an In-Memory LRU Cache with O(1) Operations
**Category:** Data Structures & Algorithms
**Key Concepts:** Hash Map, Doubly Linked List, Eviction Policy, Constant Time O(1)
**Difficulty:** Medium
**Time Complexity:** O(1) for both get and put
**Space Complexity:** O(capacity)
**Answer:**
To achieve strictly O(1) time complexity for both \`get(key)\` and \`put(key, val)\`:
1. Use a **Hash Map** storing \`key -> Node\` for O(1) pointer lookup.
2. Use a **Doubly Linked List (DLL)** with dummy head and dummy tail nodes to maintain usage recency order without edge-case \`null\` checks.
3. On \`get\`: Move the accessed node to the head of the DLL.
4. On \`put\`: If key exists, update value and move to head. If new, create node and insert at head. If capacity is exceeded, evict \`tail.prev\` and delete from map.

\`\`\`python
class Node:
    def __init__(self, key: int = 0, val: int = 0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}  # key -> Node
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node):
        p, n = node.prev, node.next
        p.next = n
        n.prev = p

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
            del self.cache[lru.key]
\`\`\`

**Mistake Identified:**
Initially tried using Python's \`OrderedDict\` without understanding how to construct the pointer manipulation from scratch. Failed to handle dummy head/tail pointers cleanly on the whiteboard.

**What to Learn:**
Always implement the underlying Doubly Linked List primitives (\`_remove\`, \`_add_to_front\`) first. Discuss thread safety and lock striping as follow-ups.

---

## Round 3: Distributed System Architecture & Theory
**Interviewer:** Principal Architect (Google Cloud Spanner)
**Round Type:** System Design & Theory
**Round Notes:** High-level system design focusing on trade-offs between consistency, availability, database storage engines, and edge caching.

### Q4: [Theory] Compare B-Trees vs. LSM-Trees in Modern Databases
**Category:** Database & Storage Engines
**Key Concepts:** B+ Tree, LSM-Tree, Write Amplification, MemTable, SSTables, Compaction
**Difficulty:** Hard
**Answer:**
1. **B+ Trees (PostgreSQL, MySQL InnoDB)**:
   - **Structure**: Multi-way balanced tree stored in fixed-size disk blocks (pages).
   - **Performance**: Optimized for random reads (O(log N) page lookups with buffer pool caching).
   - **Bottleneck**: In-place page updates cause high write amplification and random disk I/O when writing updates.
2. **LSM-Trees / Log-Structured Merge Trees (Cassandra, RocksDB, BigTable)**:
   - **Structure**: Appends incoming writes to an in-memory sorted buffer (\`MemTable\`) and Write-Ahead Log (WAL). When full, flushes to immutable disk files (\`SSTables\`).
   - **Performance**: Extremely high sequential write throughput. Reads check MemTable, then SSTables using Bloom Filters.
   - **Trade-off**: Requires periodic background compaction to merge SSTables, which incurs read/write spikes.

**Mistake Identified:**
Stated that NoSQL is always faster than SQL without understanding the underlying storage engine distinction (sequential append of LSM-Trees vs random I/O of B-Trees).

**What to Learn:**
Anchor database architecture discussions in disk access patterns (sequential append vs random block read), page cache utilization, and Bloom filter lookups.

---

## Round 4: Behavioral & Engineering Leadership (Googliness)
**Interviewer:** Engineering Director
**Round Type:** Behavioral / HR
**Round Notes:** Probes cultural alignment, ability to navigate technical ambiguity, resolving cross-functional disagreement, and mentoring engineers.

### Q5: [Behavioral] Describe a scenario where you disagreed with a Staff/Principal engineer's technical design.
**Category:** Behavioral & Leadership
**Key Concepts:** STAR Framework, Disagree & Commit, Data-Driven Argument, Stakeholder Management
**Difficulty:** Medium
**Answer:**
- **Situation**: During an infrastructure migration, a senior architect proposed moving our primary transactional datastore from Postgres to DynamoDB to "scale writes", despite our workflow requiring multi-table ACID joins.
- **Task**: As the lead implementer, I had to evaluate whether the proposed NoSQL redesign would introduce data corruption risks or excessive application-level joins.
- **Action**: Rather than engaging in subjective debate, I created a benchmarking prototype simulating peak read/write throughput with our actual query access patterns. I demonstrated that Postgres with partitioned tables and read-replicas satisfied our 10x traffic forecast at 1/4th the operational complexity.
- **Result**: The team adopted the partitioned PostgreSQL architecture, saving $120,000 in projected cloud egress and delivering the migration 6 weeks ahead of deadline with zero data anomalies.

**Mistake Identified:**
Used the vague word "we resolved it" without clarifying what specific benchmarks, numbers, or leadership steps I took personally.

**What to Learn:**
Always format answers with the STAR framework: Situation, Task, Action (specific personal code/data), and Result (quantified metrics: $, ms, % reduction).
`;

export const SAMPLE_STRIPE_DEBRIEF_MD = `# Stripe - Staff Software Engineer (Infrastructure & Payments)
**Company:** Stripe
**Role:** Staff Infrastructure Engineer
**Status:** Rejected / Lessons Learned
**Interview Date:** 2026-01-14

Stripe's interview process heavily emphasizes production-grade engineering: idempotency, zero-downtime database migrations, resilient webhooks, and concurrency safety.

---

## Round 1: Practical API Design, Idempotency & Concurrency Theory
**Interviewer:** Staff Backend Engineer
**Round Type:** Technical & Theory Screen
**Round Notes:** Evaluating distributed locks, idempotency keys, and race condition prevention.

### Q1: [Theory] How do Idempotency Keys prevent duplicate charges in distributed financial systems?
**Category:** Distributed Systems & Architecture
**Key Concepts:** Idempotency Key, Distributed Lock, Mutex, State Machine, Two-Phase Commit
**Difficulty:** Hard
**Answer:**
An idempotency key is a unique client-generated UUID sent in the HTTP request header (\`Idempotency-Key: <uuid>\`).
1. When a request arrives, the API gateway performs an atomic \`INSERT\` or \`SETNX\` (Redis/Postgres) with the key and a \`PROCESSING\` status.
2. If the key already exists and is in \`PROCESSING\`, the server returns HTTP 409 (Conflict) or holds until resolution to avoid concurrent race conditions.
3. If the key is \`SUCCEEDED\`, the server returns the cached response immediately without invoking the payment processor.
4. If the downstream payment gateway fails or times out, the idempotency record is updated with the error payload so subsequent retries observe the exact same state.

**Mistake Identified:**
Failed to account for the in-flight race condition when two requests with the same idempotency key arrive within 2 milliseconds before the first request finishes writing to the database.

**What to Learn:**
Use an atomic distributed lock with a short lease TTL (e.g., Redis Redlock or Postgres conditional update \`UPDATE charges SET status='PROCESSING' WHERE key=X AND status='PENDING'\`).

---

## Round 2: Practical Coding - Resilient Webhook Dispatcher
**Interviewer:** Senior Systems Engineer
**Round Type:** Practical Coding
**Round Notes:** Real-world IDE coding with focus on unit testing, exponential backoff, and jitter.

### Q2: [Coding] Implement Webhook Delivery with Exponential Backoff and Decorrelated Jitter
**Category:** Distributed Systems & Networking
**Key Concepts:** Exponential Backoff, Full Jitter, Retries, Circuit Breaker
**Difficulty:** Medium
**Answer:**
When delivering webhooks to merchant endpoints that may be temporarily overloaded:
$$\text{delay} = \min(\text{max\_backoff}, \text{base} \times 2^{\text{attempt}}) + \text{random\_jitter}$$
Jitter prevents the "Thundering Herd" problem where thousands of failed webhooks synchronize and retry at the exact same millisecond.

\`\`\`typescript
interface WebhookPayload {
  id: string;
  url: string;
  payload: Record<string, unknown>;
  attempts: number;
}

export async function dispatchWebhookWithBackoff(
  job: WebhookPayload,
  maxAttempts = 5,
  baseMs = 1000,
  maxBackoffMs = 32000
): Promise<boolean> {
  while (job.attempts < maxAttempts) {
    try {
      const response = await fetch(job.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job.payload),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (response.ok) return true;
    } catch (err) {
      // Network timeout or connection drop
    }

    job.attempts++;
    if (job.attempts >= maxAttempts) break;

    // Exponential Backoff with Full Jitter
    const exponential = Math.min(maxBackoffMs, baseMs * Math.pow(2, job.attempts));
    const delay = Math.random() * exponential;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return false;
}
\`\`\`

**Mistake Identified:**
Omitted \`AbortSignal.timeout\`, allowing requests to hang indefinitely if the receiving server socket didn't close.

**What to Learn:**
Never make an external HTTP call in production without strict socket timeouts and jittered backoff.
`;

export const PRESET_SAMPLE_FILES = [
  {
    id: 'google-l5',
    title: 'Google L5 SWE - 4 Rounds & Theory Debrief',
    company: 'Google',
    role: 'Senior SWE (L5)',
    description: '4-Round technical interview covering React/V8 theory, LRU Cache coding, LSM-Trees vs B-Trees, and Googliness leadership.',
    markdown: SAMPLE_GOOGLE_DEBRIEF_MD,
  },
  {
    id: 'stripe-staff',
    title: 'Stripe Staff Engineer - Idempotency & Webhooks',
    company: 'Stripe',
    role: 'Staff Infrastructure Engineer',
    description: '3-Round debrief covering payment idempotency race conditions, webhook backoff coding, and distributed transactions.',
    markdown: SAMPLE_STRIPE_DEBRIEF_MD,
  },
];
