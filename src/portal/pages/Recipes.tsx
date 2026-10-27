import { useState } from 'react'
import { actions, useStore } from '../../store'
import { ReferenceDoc } from '../ReferenceDoc'
import { CardNavToggle, FigTree, FtLeaf, FtSection, PageHero } from './parts'

/* Recipes — list (Figma 64:14632) and a recipe's detail (78:22146), which
   reuses the API reference page beside an "All recipes" endpoint tree. */

export const RECIPES = [
  { id: 'savings', title: 'Current & Savings Accounts', desc: 'Explore our comprehensive collection of published guides, designed to help you navigate various topics with ease. Each guide offers valuable insights and practical tips for your journey.', apis: 4, guides: 8, endpoints: 12 },
  { id: 'open-savings', title: 'Open Savings Account', desc: 'Discover our shipping options and policies, tailored to provide flexibility and convenience. Get details on international shipping, tracking, and delivery estimates.', apis: 3, guides: 5, endpoints: 10 },
  { id: 'loan-approval', title: 'Loan Approval', desc: 'Learn about our hassle-free return process. We ensure that returning items is simple and straightforward, with guidelines to ensure a smooth experience.', apis: 2, guides: 7, endpoints: 9 },
  { id: 'fund-transfer', title: 'Domestic Fund Transfer', desc: 'Get in touch with our dedicated support team, ready to assist you with any inquiries or issues. We value your feedback and aim to provide top-notch service.', apis: 5, guides: 4, endpoints: 24 },
  { id: 'loan-processing', title: 'Loan Application Processing', desc: 'Manage your account settings and preferences. We provide tools for you to customize notifications, privacy settings, and more to enhance your experience.', apis: 5, guides: 6, endpoints: 8 },
]

export function RecipesList() {
  return (
    <div className="p-scroll pg">
      <CardNavToggle />
      <PageHero art="recipes" title="Recipes" sub="Combine APIs and guides into reusable workflows for specific use cases." />
      <div className="pg-body">
        <div className="rc-list">
          {RECIPES.map((r) => (
            <button key={r.id} className="rc-row" onClick={() => actions.setRecipe(r.id)}>
              <span className="rc-text">
                <b>{r.title}</b>
                <span>{r.desc}</span>
              </span>
              <span className="rc-stats">
                {([['APIs', r.apis], ['Guides', r.guides], ['Endpoints', r.endpoints]] as const).map(([k, v]) => (
                  <span key={k}><small>{k}</small><b>{v}</b></span>
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const ENDPOINTS = ['Subscription creation', 'Subscription details', 'Subscription details', 'List account subscriptions', 'Cancel subscription']

export function RecipeTree() {
  const [active, setActive] = useState(2)
  return (
    <FigTree title="All Recipes" back={() => actions.setRecipe(null)}>
      <FtSection name="Subscription Management" />
      {ENDPOINTS.map((e, i) => (
        <FtLeaf key={i} leaf={{ id: String(i), label: e, icon: 'BracketsCurly', tag: 'Head' }} active={active === i} onClick={() => setActive(i)} />
      ))}
    </FigTree>
  )
}

export function RecipeDetail() {
  return (
    <div className="pg-detail">
      <CardNavToggle />
      <ReferenceDoc />
    </div>
  )
}

/** Recipes rail entry: the list, or the open recipe. */
export function RecipesPage() {
  const recipeId = useStore((s) => s.recipeId)
  return recipeId ? <RecipeDetail /> : <RecipesList />
}
