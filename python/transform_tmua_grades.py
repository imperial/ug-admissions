import argparse

import pandas as pd


def transform_grades(cycle: str, input_file: str, output_file: str):
    csv = pd.read_csv(input_file)

    csv = csv[['College ID', 'TMUA score']]
    csv = csv.rename(columns={'College ID': 'CID', 'TMUA score': 'TMUA Score'})
    csv['CID'] = csv['CID'].apply(lambda x: f'0{x}')
    csv['Admissions Cycle'] = cycle

    # Order the columns
    csv = csv[['CID', 'Admissions Cycle', 'TMUA Score']]
    csv.to_csv(output_file, index=False)


def main():
    parser = argparse.ArgumentParser(description='Transform TMUA grades.')
    parser.add_argument('cycle', type=str, help='The admissions cycle of the TMUA grades')
    parser.add_argument('input_file', type=str, help='The input file containing TMUA grades')
    parser.add_argument('output_file', type=str, help='The output file to save transformed grades')

    args = parser.parse_args()
    transform_grades(args.cycle, args.input_file, args.output_file)


if __name__ == '__main__':
    main()
