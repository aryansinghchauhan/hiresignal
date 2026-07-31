import puppeteer from 'puppeteer'
import pool from '../db/connection.js'

// Role categories mapped to search keywords
const SEARCH_QUERIES = [
  { keyword: 'Node.js backend developer', role_category: 'backend' },
  { keyword: 'React.js frontend developer', role_category: 'frontend' },
  { keyword: 'full stack developer React Node', role_category: 'fullstack' },
  { keyword: 'machine learning engineer Python', role_category: 'ml' },
  { keyword: 'data engineer Python Spark', role_category: 'data' },
  { keyword: 'DevOps engineer Kubernetes', role_category: 'devops' }
]

async function scrapeRemoteOK(browser, keyword, role_category) {
  const jobs = []

  try {
    const page = await browser.newPage()

    // Set a real browser user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    const searchUrl = `https://remoteok.com/remote-${keyword.split(' ').join('-')}-jobs`
    console.log(`[Scraper] Visiting: ${searchUrl}`)

    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 })

    // Wait for job listings to load
    await page.waitForSelector('tr.job', { timeout: 10000 }).catch(() => {})

    // Extract job data from the page
    const pageJobs = await page.evaluate((category) => {
      const rows = document.querySelectorAll('tr.job')
      const results = []

      rows.forEach((row, index) => {
        if (index >= 10) return // Max 10 per search

        const titleEl = row.querySelector('h2[itemprop="title"]')
        const companyEl = row.querySelector('h3[itemprop="name"]')
        const descEl = row.querySelector('.description')
        const linkEl = row.querySelector('a[href]')

        const title = titleEl?.innerText?.trim()
        const company = companyEl?.innerText?.trim()
        const description = descEl?.innerText?.trim()
        const url = linkEl ? `https://remoteok.com${linkEl.getAttribute('href')}` : null

        if (title && company && description && url) {
          results.push({ title, company, description, url, role_category: category })
        }
      })

      return results
    }, role_category)

    jobs.push(...pageJobs)
    console.log(`[Scraper] Found ${pageJobs.length} jobs for "${keyword}"`)

    await page.close()

    // Random delay between 2-4 seconds to avoid being blocked
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000))

  } catch (err) {
    console.error(`[Scraper] Failed for "${keyword}":`, err.message)
  }

  return jobs
}

async function saveJobs(jobs) {
  let saved = 0

  for (const job of jobs) {
    try {
      await pool.query(
        `INSERT INTO jobs (title, company, description, url, role_category)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (url) DO NOTHING`,
        [job.title, job.company, job.description, job.url, job.role_category]
      )
      saved++
    } catch (err) {
      // Skip duplicates silently
    }
  }

  return saved
}

export async function runScraper() {
  console.log('[Scraper] Starting scrape job...')

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  let totalSaved = 0

  for (const query of SEARCH_QUERIES) {
    const jobs = await scrapeRemoteOK(browser, query.keyword, query.role_category)
    const saved = await saveJobs(jobs)
    totalSaved += saved
  }

  await browser.close()
  console.log(`[Scraper] Finished — ${totalSaved} new jobs saved to database`)
  return totalSaved
}