const excel = require("exceljs")

module.exports = {
    makeExcel: async (data) => {
        try {
            let workBook = new excel.Workbook()

            const sheet = workBook.addWorksheet("books")
            sheet.columns = [
                {header:"Lecture",key:"lecture", width:50},
                {header:"Detail Link",key:"detlink", width:50},
                {header:"Title",key:"title", width:50},
                {header:"Authors",key:"author", width:50},
                {header:"Journal",key:"journal", width:25},
                {header:"Year",key:"year", width:25},
                {header:"Citation",key:"citation", width:25},
                {header:"Citation Link",key:"citlink", width:50}
            ]

            await data.map((value)=>{
                sheet.addRow({lecture: value.lecture, detlink: value.detlink, title: value.title, author: value.author, journal: value.journal, year: value.year, citation: value.citation, citlink: value.citlink})
            })

            await workBook.xlsx.writeFile("Scholar.xlsx")
            console.log("Write Data Success");
        } catch (error) {
            console.log(error);
        }

    }
}