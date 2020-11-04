# importing csv module 
import csv 

# csv file name 
filename = "mhs_2020"
# gender_column = 2			#2014
# gender_column = 56		#2016
# gender_column = 113		#2017
gender_column = 113		#2019

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
	print("Total no. of rows: %d"%(csvreader.line_num)) 

# printing the field names 
# print('Field names are:' + ', '.join(field for field in fields)) 

# for field in fields:
# 	print(field)

print(len(fields))


# FILTER DATA

all_genders_set = {"female", "male"}
filtered_genders_set = {"female", "male"}
female_set  = {"female", "Woman", "Female (cis)", "woman", "Cis Female", "cis-female/femme", "Female", 
	"Female ", "female ", "F", "f", "Female (props for making this a freeform field, though)", "Cis female ",
	" Female", "Cis-woman", "femalw", "cis female", "female (cis)", "F, cisgender", "female (cisgender)",
	"femail", "cis-Female", "Female (cis) ", "cis woman", "Cis-Female", "Cis woman", "Female (cisgender)",
	"cisgender female", "Cisgendered woman"}
male_set = {"Mail", "Male (CIS)", "Cis Man", "Cis Male", "Man", "Male", "cis male", "Male ", "male", 
	"Malr", "male ", "M", "m", "Male.", "cis man", 
	"I'm a man why didn't you make this a drop down question. You should of asked sex? And I would of answered yes please. Seriously how much text can this take? ",
	"man", "mail", "M|", "Cis male", "Male (cis)", "MALE", "Sex is male", "cis male ", "cis-male", "Cis-male", 
	"male (hey this is the tech industry you're talking about)", "Male, cis", "Make", "CIS Male", "Malel",
	"Cisgender male"}

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


# writing CSV File
# name of csv file 
filename = "filtered_" + filename + ".csv"
	
# writing to csv file 
with open(filename, 'w') as csvfile: 
	# creating a csv writer object 
	csvwriter = csv.writer(csvfile) 
		
	# writing the fields 
	csvwriter.writerow(fields) 
		
	# writing the data rows 
	csvwriter.writerows(rows) 



