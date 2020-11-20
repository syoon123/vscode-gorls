# importing csv module 
import csv 

gender_columns = {
    '2014': 2,
    '2016': 56,
    '2017': 113,
    '2018': 113,
    '2019': 76,
#     '2020': 113
}

all_genders_set = {"female", "male"}
filtered_genders_set = {"female", "male"}
female_set  = {"female", "Woman", "Female (cis)", "woman", "Cis Female", "cis-female/femme", "Female",
    "Female ", "female ", "F", "f", "Female (props for making this a freeform field, though)", "Cis female ",
    " Female", "Cis-woman", "femalw", "cis female", "female (cis)", "F, cisgender", "female (cisgender)",
    "femail", "cis-Female", "Female (cis) ", "cis woman", "Cis-Female", "Cis woman", "Female (cisgender)",
    "cisgender female", "Cisgendered woman", 'I identify as female', 'Woman-identified', 'My sex is female.',
    'Femile', 'femmina', 'fm', 'I identify as female.', 'Cisgender Female', "fem"}
male_set = {"Mail", "Male (CIS)", "Cis Man", "Cis Male", "Man", "Male", "cis male", "Male ", "male",
    "Malr", "male ", "M", "m", "Male.", "cis man", 'male, born with xy chromosoms',
    "I'm a man why didn't you make this a drop down question. You should of asked sex? And I would of answered yes please. Seriously how much text can this take? ",
    "man", "mail", "M|", "Cis male", "Male (cis)", "MALE", "Sex is male", "cis male ", "cis-male", "Cis-male",
    "male (hey this is the tech industry you're talking about)", "Male, cis", "Make", "CIS Male", "Malel",
    "Cisgender male", 'SWM', 'cis hetero male', 'Identify as male', 'cisdude', 'dude', 'Dude', 'Cishet male'}

def clean(year):
    # csv file name
    filename = "mhs_" + year
    print('Year: ' + year)
    gender_column = gender_columns[year]

    # initializing the titles and rows list
    fields = []
    rows = []

    # reading csv file
    with open(filename + ".csv", 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # extracting field names through first row
        fields = next(csvreader)

        # extracting each data row one by one
        for row in csvreader:
            rows.append(row)

        # get total number of rows
#         print("Total no. of rows: %d"%(csvreader.line_num))

    for i in range(len(fields)):
        fields[i] = fields[i].replace('<strong>', '')
        fields[i] = fields[i].replace('</strong>', '')
        fields[i] = fields[i].replace('<em>', '')
        fields[i] = fields[i].replace('</em>', '')
        fields[i] = fields[i].replace('\xa0', ' ')
        fields[i] = fields[i].replace('*', '')

    contains_utf8 = filter(lambda f: '\xa0' in f or '<' in f, fields)
#     print(list(contains_utf8))
#     print('\n')

    # for field in fields:
    # 	print(field)
#     print('Total no. of fields: ' + str(len(fields)))

    for row in rows:
        all_genders_set.add(row[gender_column])
        if (row[gender_column] in female_set):
            row[gender_column] = "female"
        elif (row[gender_column] in male_set):
            row[gender_column] = "male"
        filtered_genders_set.add(row[gender_column])

    print("Genders before filter")
    print(all_genders_set)
    print("Genders after filter")
    print(filtered_genders_set)
    print('\n')

    # writing CSV File
    # name of csv file
    filename = "cleaned_" + filename + ".csv"

    # writing to csv file
    with open(filename, 'w') as csvfile:
        # creating a csv writer object
        csvwriter = csv.writer(csvfile)

        # writing the fields
        csvwriter.writerow(fields)

        # writing the data rows
        csvwriter.writerows(rows)


for year in gender_columns.keys():
    clean(year)
