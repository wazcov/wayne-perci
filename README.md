# wayne-perci

Basic node app that reads from a CSV, stores rows and allows them to be queried.

## Useage

- `npm run dev` - starts the script to load the CSV into JSON, and starts a server
- `curl http://localhost:3000/members/<id>` to query for a member by id

## Validation

- uses zod, rules are in `src/validate.ts`
- partner_member_id has to be a GUID
- if the same id shows up twice the first one is kept and the later ones are rejected
- first and last name can't be blank
- dates have to be real dates in YYYY-MM-DD, so 1990-02-30 or 14/03/1991 get rejected
- date of birth can't be in the future
- email has to look like a proper email address
- policy_end can be left blank for an open ended policy, otherwise it can't be before policy_start
- rows with missing columns get rejected, but extra columns are just dropped (not caught yet)
- failing rows are left out of the json and logged with their line number and every reason they failed

## Notes

- csv file is hardcoded, could make it a .env file in future
- json file is hardcoded, could make it a .env file in future
- csv lib simplest to add