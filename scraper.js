const puppeteer = require("puppeteer")
const excel = require("./excel")
let arr = [
    "https://scholar.google.com/citations?user=fckDT2oAAAAJ&hl=id&oi=ao",
    "https://scholar.google.com/citations?user=6TfiIDQAAAAJ&hl=id&oi=ao",
    "https://scholar.google.com/citations?hl=id&user=EnMigTsAAAAJ",
    "https://scholar.google.com/citations?hl=id&user=gVttN-IAAAAJ",
    "https://scholar.google.com/citations?user=3pCLMJoAAAAJ&hl=id"
]
let data = []
const scrape = async (link) => {
    // Start a Puppeteer session with:
    // - headless = "new" => the browser gonna work in background
    // - headless = false => the browser gonna be visible and you can see all actions
    // - no default viewport (`defaultViewport: null` - website page will be in full width and height)
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    // Open a new page
    const page = await browser.newPage();
    console.log("Browser opened!");

    // On this new page:
    // - open the "http://books.toscrape.com/" website
    // - wait until the dom content is loaded (HTML is ready)
    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });
    console.log("Page opened!");
    let lecture = "null";
    lecture = await page.$eval("div#gsc_prf_in", el => el.textContent)
    console.log(`get ${lecture}`);
    let more = true
    let isButtonDisabled = false;

    while (!isButtonDisabled) {
        // Click the "Tampilkan lainnya" button

        await page.click('#gsc_bpf_more');

        // Wait for some time to let the content load (adjust the timeout as needed)
        await page.waitForTimeout(3000);

        // Check if the button is disabled
        isButtonDisabled = await page.$eval('#gsc_bpf_more', (button) => button.hasAttribute('disabled'));
    }
    // find all elements that have given selectors
    const targets = await page.$$("tr.gsc_a_tr")
    for (const target of targets) {
        try {
            let detailUrl = "null";
            let detlink = await target.$eval("td.gsc_a_t > a.gsc_a_at", el => el.getAttribute("href"))
            if (detlink != null) {
                detailUrl = "https://scholar.google.com" + detlink
            }
            let newPage = await browser.newPage();
            await newPage.goto(detailUrl, {
                waitUntil: "domcontentloaded",
            });
            //book url
            // get attribute href from tag a in parent tag div class=image_container
            let title = "null";
            title = await newPage.$eval("div#gsc_oci_title_wrapper > div#gsc_oci_title > a.gsc_oci_title_link", el => el.textContent)
            console.log(`get ${title}`);
            // some url in bookUrl will have catalogue and some will not, so lets delete it if it exists

            let author = "null";
            let year = "null";
            let journal = "null";
            const details = await newPage.$$("div.gs_scl");
            for (const detail of details) {
                const head = await detail.$eval(" div.gs_scl > div.gsc_oci_field", el => el.textContent)
                if (head == "Pengarang" || head == "Penulis" || head == "Penemu") {
                    author = await detail.$eval(" div.gs_scl > div.gsc_oci_value", el => el.textContent)
                } else if (head == "Tanggal terbit") {
                    year = await detail.$eval(" div.gs_scl > div.gsc_oci_value", el => el.textContent)
                } else if (head == "Jurnal") {
                    journal = await detail.$eval(" div.gs_scl > div.gsc_oci_value", el => el.textContent)
                } else {
                    console.log(`get ${head}`);
                }
            }
            console.log(`get ${author}`);
            console.log(`get ${year}`);
            console.log(`get ${journal}`);

            // Assuming the first element is authors and the second is the journal
            await newPage.close();
            let citation = "null";
            citation = await target.$eval("td.gsc_a_c", el => el.textContent)
            console.log(`get ${citation}`);

            let citlink = "null";
            citlink = await target.$eval("td.gsc_a_c > a.gsc_a_ac", el => el.getAttribute("href"))
            console.log(`get ${citlink}`);
            //book title
            // get attribute title form tag a in parent tag h3
            // const title = await target.$eval("h3 > a", el => el.getAttribute("title"))
            //book price
            // get text that contained in tag p with class=price_color in parent tag div with class=product_price


            //book imageUrl
            // get attribute src in tag img in parent tag a in parent tag div class=imgae_container
            // const image = await target.$eval("div.image_container > a > img", el => "books.toscrape.com/" + el.getAttribute("src"))

            // open new page for detail of book
            //book stock
            // get text that contained in tag p with class=instock.availability

            let bookData = {
                lecture: lecture,
                detlink: detailUrl,
                title: title,
                author: author,
                journal: journal,
                year: year,
                citation: citation,
                citlink: citlink
            }

            data.push(bookData)
        } catch (err) {
            console.log(err)
        }
    }
    // close browser
    await browser.close();
    console.log("Browser closed!");
};

// Start the scraping
const start = async () => {
    for (let i = 0; i < arr.length; i++) {
        await scrape(arr[i])
        console.log("Scraping done! " + arr[i]);
    }
    await excel.makeExcel(data);
    console.log("Excel created!");
}

start();