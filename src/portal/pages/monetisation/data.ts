/* Monetisation mock data. The model follows the PM's flow with the
   subscription layer removed:

     App ──▶ Package ──▶ Product ──▶ Endpoint
     App ─────────────▶ Product ──▶ Endpoint

   A package is a priced bundle of products; a product is a set of gateway
   resources. Credentials and validity live on the app. */

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface Endpoint {
  method: Method
  name: string
  path: string
  desc: string
  /** Id of a metering rule that prices this endpoint differently. */
  rule?: string
}

export type Access = 'open' | 'restricted' | 'requested'

export interface Product {
  id: string
  name: string
  desc: string
  gateway: 'Apigee' | 'Kong' | 'AWS'
  access: Access
  endpoints: Endpoint[]
}

export interface Tier { range: string; price: string }

export interface RateCard {
  model: 'Flat rate' | 'Per call' | 'Graduated' | 'Volume'
  base: Tier[]
  fee?: Tier[]
}

export interface Condition { field: string; op: string; value: string }

export interface MeteringRule {
  id: string
  name: string
  desc: string
  /** Conditions inside a group are OR-ed; groups are AND-ed. */
  when: Condition[][]
  rate: RateCard
}

export interface Review { name: string; date: string; rating: number; text: string }

export interface Package {
  id: string
  name: string
  desc: string
  about: string
  category: string
  rating: number
  reviews: number
  usedBy: string
  products: string[]
  pricing: RateCard
  rules: string[]
  from: string
  guides: string[]
  updated: string
}

export interface App {
  id: string
  name: string
  desc: string
  status: 'Approved' | 'Pending'
  packages: string[]
  products: string[]
  created: string
  validUntil: string
  calls: string
  spend: string
  /** Daily calls for the last 30 days, for sparklines and charts. */
  trend: number[]
}

/* ------------------------------------------------------------ products */

export const PRODUCTS: Product[] = [
  {
    id: 'accounts', name: 'Account Management', gateway: 'Apigee', access: 'open',
    desc: 'Create customers and manage the lifecycle of their accounts.',
    endpoints: [
      { method: 'POST', name: 'Create customer', path: '/v1/customers', desc: 'Registers a new customer profile.' },
      { method: 'PUT', name: 'Update customer', path: '/v1/customers/{id}', desc: 'Replaces the editable fields on a customer.' },
      { method: 'GET', name: 'Customer details', path: '/v1/customers/{id}/details', desc: 'Returns the full profile, including linked accounts.', rule: 'high-usage' },
      { method: 'GET', name: 'List accounts', path: '/v1/accounts', desc: 'Lists accounts owned by a customer.' },
      { method: 'PATCH', name: 'Update account status', path: '/v1/accounts/{id}/status', desc: 'Freezes, unfreezes or closes an account.' },
    ],
  },
  {
    id: 'payments', name: 'Payments & Transfers', gateway: 'Apigee', access: 'open',
    desc: 'Move money between accounts with real-time status.',
    endpoints: [
      { method: 'POST', name: 'Initiate fund transfer', path: '/v1/transfers', desc: 'Starts a transfer between two accounts.', rule: 'bulk-transfer' },
      { method: 'POST', name: 'Validate beneficiary', path: '/v1/beneficiaries/validate', desc: 'Checks a beneficiary before the first transfer.' },
      { method: 'GET', name: 'Transfer status', path: '/v1/transfers/{id}/status', desc: 'Returns the current state of a transfer.' },
      { method: 'POST', name: 'ACH initiation', path: '/v1/transfers/ach', desc: 'Queues a batch ACH transfer.' },
      { method: 'DELETE', name: 'Cancel scheduled transfer', path: '/v1/transfers/{id}', desc: 'Cancels a transfer that has not settled.' },
    ],
  },
  {
    id: 'ledger', name: 'Transactions & Ledger', gateway: 'Apigee', access: 'restricted',
    desc: 'The source of truth for balances and transaction history.',
    endpoints: [
      { method: 'GET', name: 'List transactions', path: '/v1/transactions', desc: 'Paginated history with filters.' },
      { method: 'GET', name: 'Transaction details', path: '/v1/transactions/{id}', desc: 'A single posted transaction.' },
      { method: 'GET', name: 'Ledger balances', path: '/v1/ledger/balances', desc: 'Available and posted balances.' },
      { method: 'POST', name: 'Reconcile ledger', path: '/v1/ledger/reconcile', desc: 'Runs a reconciliation for a period.' },
    ],
  },
  {
    id: 'loans', name: 'Loans & Credit', gateway: 'Kong', access: 'open',
    desc: 'Loan origination, repayment schedules and credit checks.',
    endpoints: [
      { method: 'POST', name: 'Submit application', path: '/v1/loans/applications', desc: 'Creates a loan application.' },
      { method: 'GET', name: 'Loan details', path: '/v1/loans/{id}', desc: 'Principal, rate and current state.' },
      { method: 'GET', name: 'Repayment schedule', path: '/v1/loans/{id}/schedule', desc: 'Upcoming instalments for a loan.' },
      { method: 'POST', name: 'Credit score', path: '/v1/credit/score', desc: 'Pulls a credit score for an applicant.', rule: 'high-usage' },
    ],
  },
  {
    id: 'kyc', name: 'KYC & Identity', gateway: 'Kong', access: 'open',
    desc: 'Verify customers and keep their documents on file.',
    endpoints: [
      { method: 'POST', name: 'Verify identity', path: '/v1/kyc/verify', desc: 'Runs identity checks on a customer.' },
      { method: 'GET', name: 'Verification status', path: '/v1/kyc/{id}/status', desc: 'Returns the outcome of a check.' },
      { method: 'POST', name: 'Upload document', path: '/v1/kyc/documents', desc: 'Attaches a document to a customer.' },
    ],
  },
  {
    id: 'cards', name: 'Card Services', gateway: 'Apigee', access: 'requested',
    desc: 'Issue cards, set limits and block lost cards.',
    endpoints: [
      { method: 'GET', name: 'List cards', path: '/v1/cards', desc: 'Cards issued to a customer.' },
      { method: 'POST', name: 'Block card', path: '/v1/cards/{id}/block', desc: 'Blocks a card immediately.' },
      { method: 'PATCH', name: 'Update limits', path: '/v1/cards/{id}/limits', desc: 'Changes spend and withdrawal limits.' },
    ],
  },
  {
    id: 'investments', name: 'Investments', gateway: 'AWS', access: 'open',
    desc: 'Fund catalogue, orders and portfolio positions.',
    endpoints: [
      { method: 'GET', name: 'List funds', path: '/v1/funds', desc: 'Funds available to invest in.' },
      { method: 'POST', name: 'Place order', path: '/v1/funds/{id}/orders', desc: 'Buys or redeems units of a fund.' },
      { method: 'GET', name: 'Portfolio', path: '/v1/portfolio/{id}', desc: 'Positions and returns for a customer.' },
    ],
  },
]

/* ------------------------------------------------------------ pricing */

const GRADUATED: RateCard = {
  model: 'Graduated',
  base: [
    { range: 'First 1,000 calls', price: 'Free' },
    { range: '1,001 – 10,000 calls', price: '$0.002 / call' },
    { range: '10,001+ calls', price: '$0.001 / call' },
  ],
  fee: [{ range: 'Platform fee', price: '$100 / month' }],
}

export const RULES: Record<string, MeteringRule> = {
  'high-usage': {
    id: 'high-usage',
    name: 'High usage',
    desc: 'Applies when an app’s usage passes the plan thresholds.',
    when: [
      [
        { field: 'monthly_api_calls', op: '>', value: '100000' },
        { field: 'requests_per_minute', op: '>=', value: '500' },
      ],
      [
        { field: 'is_trial_app', op: '=', value: 'false' },
      ],
    ],
    rate: {
      model: 'Volume',
      base: [
        { range: 'Up to 100,000 calls', price: '$0.004 / call' },
        { range: '100,001+ calls', price: '$0.003 / call' },
      ],
    },
  },
  'bulk-transfer': {
    id: 'bulk-transfer',
    name: 'Bulk transfers',
    desc: 'Transfers above the bulk size are charged per batch.',
    when: [
      [{ field: 'batch_size', op: '>', value: '50' }],
    ],
    rate: {
      model: 'Per call',
      base: [{ range: 'Each batch', price: '$0.05 / call' }],
      fee: [{ range: 'Settlement fee', price: '$0.01 / call' }],
    },
  },
}

/* ------------------------------------------------------------ packages */

export const CATEGORIES = ['Accounts', 'Payments', 'Lending', 'Cards', 'Investments']

export const PACKAGES: Package[] = [
  {
    id: 'accounts-essentials', name: 'Accounts Essentials', category: 'Accounts',
    desc: 'Onboard customers, verify them and manage their accounts.',
    about: 'Everything an app needs to open and run customer accounts: create and update customers, run identity checks and manage account status. Most banking apps start here.',
    rating: 4.8, reviews: 212, usedBy: '1.2k apps',
    products: ['accounts', 'kyc'], rules: ['high-usage'],
    pricing: GRADUATED, from: '$0.002',
    guides: ['Getting started with Accounts', 'Verifying a customer'], updated: '12 Oct 2026',
  },
  {
    id: 'instant-payments', name: 'Instant Payments', category: 'Payments',
    desc: 'Real-time transfers with beneficiary checks built in.',
    about: 'Send money between accounts in real time. Includes beneficiary validation and transfer tracking, plus the account endpoints you need to look up payers.',
    rating: 4.6, reviews: 158, usedBy: '940 apps',
    products: ['payments', 'accounts'], rules: ['bulk-transfer', 'high-usage'],
    pricing: {
      model: 'Per call',
      base: [{ range: 'Every call', price: '$0.004 / call' }],
      fee: [{ range: 'Settlement fee', price: '$0.01 / transfer' }],
    },
    from: '$0.004',
    guides: ['Making your first transfer', 'Handling failed transfers'], updated: '3 Oct 2026',
  },
  {
    id: 'lending-suite', name: 'Lending Suite', category: 'Lending',
    desc: 'Originate loans, score applicants and track repayments.',
    about: 'A complete lending flow, from application and credit scoring to repayment schedules. KYC is included so applicants can be verified in the same app.',
    rating: 4.7, reviews: 96, usedBy: '410 apps',
    products: ['loans', 'kyc', 'accounts'], rules: ['high-usage'],
    pricing: {
      model: 'Volume',
      base: [
        { range: 'Up to 10,000 calls', price: '$0.003 / call' },
        { range: '10,001 – 100,000 calls', price: '$0.002 / call' },
        { range: '100,001+ calls', price: '$0.0015 / call' },
      ],
    },
    from: '$0.0015',
    guides: ['Loan origination walkthrough', 'Reading a credit score'], updated: '28 Sep 2026',
  },
  {
    id: 'card-services', name: 'Card Services', category: 'Cards',
    desc: 'Issue and control debit and credit cards.',
    about: 'Issue cards, change limits and block lost cards from your app. Priced as a flat monthly rate with a small per-call fee.',
    rating: 4.4, reviews: 61, usedBy: '230 apps',
    products: ['cards'], rules: [],
    pricing: {
      model: 'Flat rate',
      base: [{ range: 'Per month', price: '$1,000' }],
      fee: [{ range: 'Every call', price: '$0.0003 / call' }],
    },
    from: '$1,000 / mo',
    guides: ['Card lifecycle'], updated: '19 Sep 2026',
  },
  {
    id: 'wealth', name: 'Wealth & Investments', category: 'Investments',
    desc: 'Fund discovery, orders and portfolio views.',
    about: 'Let customers browse funds, place orders and track their portfolio. Account endpoints are included to look up the investor.',
    rating: 4.5, reviews: 74, usedBy: '180 apps',
    products: ['investments', 'accounts'], rules: [],
    pricing: GRADUATED, from: '$0.002',
    guides: ['Placing a fund order'], updated: '2 Sep 2026',
  },
  {
    id: 'business-banking', name: 'Business Banking', category: 'Accounts',
    desc: 'Accounts, payments and ledger access for business apps.',
    about: 'Built for business customers: manage accounts, move money and read ledger balances. The ledger product is restricted, so the provider reviews access first.',
    rating: 4.9, reviews: 43, usedBy: '95 apps',
    products: ['accounts', 'payments', 'ledger'], rules: ['bulk-transfer'],
    pricing: GRADUATED, from: '$0.002',
    guides: ['Business onboarding', 'Reconciling the ledger'], updated: '21 Aug 2026',
  },
]

export const REVIEWS: Review[] = [
  { name: 'Priya Nair', date: '14 Oct 2026', rating: 5, text: 'Took us an afternoon to go from sandbox to a working onboarding flow. The KYC endpoints return clear reasons when a check fails, which saved our support team a lot of back and forth.' },
  { name: 'Marco Bianchi', date: '2 Oct 2026', rating: 4, text: 'Solid and predictable. Pricing is easy to forecast with the graduated tiers. I would like webhooks for status changes instead of polling.' },
  { name: 'Aisha Rahman', date: '20 Sep 2026', rating: 5, text: 'Documentation matches the behaviour exactly, and error codes are consistent across products.' },
  { name: 'Tom Becker', date: '7 Sep 2026', rating: 4, text: 'Good coverage for account lifecycle. Took a moment to understand that the platform fee is per app, not per organisation.' },
]

export const RATING_SPLIT: [number, number][] = [[5, 148], [4, 44], [3, 12], [2, 5], [1, 3]]

/* ------------------------------------------------------------ apps */

const wave = (seed: number, base: number) =>
  Array.from({ length: 30 }, (_, i) => Math.round(base * (1 + 0.35 * Math.sin(i / 3 + seed) + 0.25 * Math.sin(i / 1.3 + seed * 2) + i / 60)))

export const APPS: App[] = [
  { id: 'instant-loan', name: 'Instant Loan App', desc: 'Loan applications with instant credit decisions.', status: 'Approved', packages: ['lending-suite', 'accounts-essentials'], products: [], created: '24 Aug 2026', validUntil: '24 Aug 2027', calls: '212K', spend: '$1,842', trend: wave(1, 7000) },
  { id: 'payments-prod', name: 'Payments – Production', desc: 'Customer-facing transfers and card controls.', status: 'Approved', packages: ['instant-payments', 'accounts-essentials'], products: ['cards'], created: '15 Jun 2026', validUntil: '15 Jun 2027', calls: '486K', spend: '$3,120', trend: wave(2, 16000) },
  { id: 'payments-test', name: 'Payments – Test', desc: 'Staging copy of the payments app.', status: 'Pending', packages: ['instant-payments'], products: [], created: '2 Oct 2026', validUntil: '2 Oct 2027', calls: '—', spend: '—', trend: Array(30).fill(0) },
  { id: 'finance-hub', name: 'Finance Hub', desc: 'Investment views for wealth customers.', status: 'Approved', packages: ['wealth'], products: ['accounts'], created: '6 Jul 2026', validUntil: '6 Jan 2027', calls: '64K', spend: '$410', trend: wave(3, 2100) },
  { id: 'insurance', name: 'Insurance Portal', desc: 'Policyholder onboarding and identity checks.', status: 'Approved', packages: [], products: ['accounts', 'kyc'], created: '15 Jan 2026', validUntil: '15 Jan 2027', calls: '38K', spend: '$0', trend: wave(4, 1300) },
]

export const appById = (id: string) => APPS.find((a) => a.id === id)!

export interface Credential { label: string; fields: [string, string][] }

export const CREDENTIALS: Credential[] = [
  { label: 'Production', fields: [['App ID', 'app_7f3a92c1e4b8'], ['Consumer key', 'ck_live_Hq82nXv41LmT0ZpYs9aK'], ['Consumer secret', 'cs_live_P0wq7RkdM3xYc81VbNe2']] },
  { label: 'Sandbox', fields: [['App ID', 'app_sbx_19d4e7aa02'], ['Consumer key', 'ck_test_Zr51kWm8QpVa3TyL0hEd'], ['Consumer secret', 'cs_test_Ue6bH2jN9sQx4LfR7cYw']] },
]

export interface LogEntry { time: string; method: Method; path: string; pkg: string; rule: string; code: number; ms: number; cost: string }

export const LOGS: LogEntry[] = [
  { time: '12:14:09', method: 'POST', path: '/v1/loans/applications', pkg: 'Lending Suite', rule: 'Default rate', code: 201, ms: 312, cost: '$0.003' },
  { time: '12:13:52', method: 'POST', path: '/v1/credit/score', pkg: 'Lending Suite', rule: 'High usage', code: 200, ms: 505, cost: '$0.004' },
  { time: '12:13:40', method: 'GET', path: '/v1/customers/{id}/details', pkg: 'Accounts Essentials', rule: 'High usage', code: 200, ms: 128, cost: '$0.004' },
  { time: '12:12:19', method: 'GET', path: '/v1/loans/{id}/schedule', pkg: 'Lending Suite', rule: 'Default rate', code: 200, ms: 96, cost: '$0.003' },
  { time: '12:11:58', method: 'POST', path: '/v1/kyc/verify', pkg: 'Accounts Essentials', rule: 'Default rate', code: 422, ms: 211, cost: '$0.002' },
  { time: '12:11:03', method: 'PUT', path: '/v1/customers/{id}', pkg: 'Accounts Essentials', rule: 'Default rate', code: 200, ms: 143, cost: '$0.002' },
  { time: '12:10:47', method: 'GET', path: '/v1/loans/{id}', pkg: 'Lending Suite', rule: 'Default rate', code: 200, ms: 88, cost: '$0.003' },
  { time: '12:10:12', method: 'GET', path: '/v1/accounts', pkg: 'Accounts Essentials', rule: 'Default rate', code: 500, ms: 1204, cost: '$0' },
]

/* ------------------------------------------------------------ invoices */

export type InvoiceStatus = 'Paid' | 'Overdue' | 'Failed' | 'Disputed'

export interface Invoice {
  id: string
  month: string
  due: string
  amount: string
  status: InvoiceStatus
  lines: { app: string; amount: string; packages: [string, string][] }[]
}

export const INVOICES: Invoice[] = [
  { id: 'INV-2026-10', month: 'October 2026', due: '15 Nov 2026', amount: '$5,372', status: 'Overdue', lines: [
    { app: 'Payments – Production', amount: '$3,120', packages: [['Instant Payments', '$2,240'], ['Accounts Essentials', '$780'], ['Card Services', '$100']] },
    { app: 'Instant Loan App', amount: '$1,842', packages: [['Lending Suite', '$1,310'], ['Accounts Essentials', '$532']] },
    { app: 'Finance Hub', amount: '$410', packages: [['Wealth & Investments', '$410']] },
  ] },
  { id: 'INV-2026-09', month: 'September 2026', due: '15 Oct 2026', amount: '$4,896', status: 'Disputed', lines: [
    { app: 'Payments – Production', amount: '$2,904', packages: [['Instant Payments', '$2,104'], ['Accounts Essentials', '$800']] },
    { app: 'Instant Loan App', amount: '$1,612', packages: [['Lending Suite', '$1,188'], ['Accounts Essentials', '$424']] },
    { app: 'Finance Hub', amount: '$380', packages: [['Wealth & Investments', '$380']] },
  ] },
  { id: 'INV-2026-08', month: 'August 2026', due: '15 Sep 2026', amount: '$4,210', status: 'Paid', lines: [
    { app: 'Payments – Production', amount: '$2,690', packages: [['Instant Payments', '$1,950'], ['Accounts Essentials', '$740']] },
    { app: 'Instant Loan App', amount: '$1,520', packages: [['Lending Suite', '$1,520']] },
  ] },
  { id: 'INV-2026-07', month: 'July 2026', due: '15 Aug 2026', amount: '$3,964', status: 'Failed', lines: [
    { app: 'Payments – Production', amount: '$2,580', packages: [['Instant Payments', '$1,880'], ['Accounts Essentials', '$700']] },
    { app: 'Instant Loan App', amount: '$1,384', packages: [['Lending Suite', '$1,384']] },
  ] },
  { id: 'INV-2026-06', month: 'June 2026', due: '15 Jul 2026', amount: '$3,102', status: 'Paid', lines: [
    { app: 'Payments – Production', amount: '$3,102', packages: [['Instant Payments', '$2,302'], ['Accounts Essentials', '$800']] },
  ] },
]

export const DISPUTE = {
  invoice: 'INV-2026-09',
  opened: '18 Oct 2026',
  reason: 'Charged for failed calls',
  thread: [
    { who: 'You', when: '18 Oct', text: 'About 4,000 calls to /v1/transfers returned 500 on 12 Sep but appear as billed.' },
    { who: 'Billing team', when: '19 Oct', text: 'Thanks, we’re checking the gateway logs for that window and will update the invoice if confirmed.' },
  ],
}

/* ------------------------------------------------------------ lookups */

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!
export const packageById = (id: string) => PACKAGES.find((p) => p.id === id)!
export const endpointCount = (pkg: Package) => pkg.products.reduce((n, id) => n + productById(id).endpoints.length, 0)
export const appsUsingPackage = (id: string) => APPS.filter((a) => a.packages.includes(id))
/** Apps reaching a product directly or through one of their packages. */
export const appsUsingProduct = (id: string) =>
  APPS.filter((a) => a.products.includes(id) || a.packages.some((p) => packageById(p).products.includes(id)))
export const packagesWithProduct = (id: string) => PACKAGES.filter((p) => p.products.includes(id))
