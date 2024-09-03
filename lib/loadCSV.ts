import { parse } from 'csv-parse/sync';


export const loadApplicants = async () => {
    const res = await fetch('/applicants.csv')
    const lines = await res.text()

    const applicants = parse(lines, {
        columns: true,
        skip_empty_lines: true
    });
    console.log(applicants)
}