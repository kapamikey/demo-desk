/**
 * Smoke: exercise repos against dedicated Demo Desk store when service role is present.
 * Usage: npm run smoke
 */
import { getEnv, getDbMode } from '../src/db/client.js'
import { demoRepo } from '../src/demos/repo.js'
import { searchRuleRepo } from '../src/search-rules/repo.js'
import { savedItemRepo } from '../src/saves/repo.js'
import type { RemixUses } from '../src/types.js'

async function main() {
  const env = getEnv()
  console.log('url', env.url)
  console.log('hasServiceRole', Boolean(env.serviceRole))
  console.log('dbMode', (() => { try { return getDbMode() } catch (e) { return String(e) } })())

  if (!env.serviceRole) {
    console.log('BLOCKER: SUPABASE_SERVICE_ROLE_KEY missing — cannot mutate.')
    console.log('Public read path can still use anon via the server.')
    try {
      const list = await demoRepo.listPublic()
      console.log('listPublic count', list.length)
      if (list[0]) {
        console.log('sample fields', {
          possibility: list[0].possibility,
          remixUses: list[0].remixUses,
          evidenceLabel: list[0].evidenceLabel,
          categories: list[0].categories,
          howThisWorks: list[0].howThisWorks,
        })
      }
    } catch (e) {
      console.error('listPublic failed', e)
    }
    process.exit(2)
  }

  const created = await demoRepo.create({
    toolCredit: 'smoke script',
    possibility: 'Smoke: voice note → desk card',
    sourceUrl: 'https://example.com/smoke',
    source: 'smoke-lab',
    mediaUrl: 'https://example.com/smoke.mp4',
    medium: 'video',
    remixUses: [
      'Paste into Demo Desk feed',
      'Tag as voice for later find',
      'Remix as operator save note',
    ] as RemixUses,
    evidenceLabel: 'smoke script',
    evidence: {
      whatIsShown: 'A short clip of a voice note becoming a card',
      whatCreatorReports: 'Worked in one pass',
      whatRemainsUncertain: 'Edge cases on accents',
      instructionsAndChecks: 'Record 30s, paste URL, confirm card fields',
      resourcesCheckedDate: '2026-09-23',
    },
    howThisWorks: {
      whatChanged: 'Voice note became a structured desk card',
      whatMadeItWork: 'Clear possibility line + three remix angles',
      whatCanIBorrow: 'Same three-angle remix pattern',
      whatRemainsUncertain: 'Whether medium filter holds for audio-only',
    },
    categories: ['audio', 'explanations & presentations'],
    replicableResult: true,
  })
  console.log('created', created.id)

  const listed = await demoRepo.listPublic()
  const found = listed.find((d) => d.id === created.id)
  console.log('on feed', Boolean(found), found && {
    possibility: found.possibility,
    remixUses: found.remixUses,
    evidenceLabel: found.evidenceLabel,
    categories: found.categories,
    source: found.source,
    medium: found.medium,
    replicableResult: found.replicableResult,
  })

  const byCat = await demoRepo.listPublic({ category: 'audio' })
  console.log('filter category=audio', byCat.some((d) => d.id === created.id))
  const byRep = await demoRepo.listPublic({ replicableResult: true })
  console.log('filter replicable=true', byRep.some((d) => d.id === created.id))
  const bySource = await demoRepo.listPublic({ source: 'smoke-lab' })
  console.log('filter source=smoke-lab', bySource.some((d) => d.id === created.id))
  const byMedium = await demoRepo.listPublic({ medium: 'video' })
  console.log('filter medium=video', byMedium.some((d) => d.id === created.id))

  const updated = await demoRepo.update(created.id, {
    possibility: 'Smoke: voice note → desk card (edited)',
  })
  console.log('updated possibility', updated.possibility)

  const rule = await searchRuleRepo.create({
    name: 'smoke-rule',
    query: 'demo OR ship',
    enabled: true,
  })
  console.log('rule', rule.id, rule.name)

  const save = await savedItemRepo.save({
    demoId: created.id,
    tags: ['voice', 'smoke'],
    note: 'try for desk',
  })
  console.log('save', save.id)
  const byTag = await savedItemRepo.find({ tag: 'voice' })
  const byNote = await savedItemRepo.find({ noteContains: 'desk' })
  console.log('find tag', byTag.length, 'find note', byNote.length)

  const byMyTag = await demoRepo.listPublic({ myTag: 'voice' })
  console.log('filter myTag=voice', byMyTag.some((d) => d.id === created.id))

  await savedItemRepo.remove(save.id)
  await searchRuleRepo.remove(rule.id)
  await demoRepo.remove(created.id)
  console.log('cleaned up')
  console.log('SMOKE OK')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
