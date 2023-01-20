import pg, { DatabaseError } from 'pg';
import dotenv from "dotenv";
import XLSX from 'xlsx';
import path from 'path';

dotenv.config();
const client = new pg.Client({
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

var wb = XLSX.readFile('./database/Project_Data.xlsx')

interface users {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: number;
  icon: string;
  password: string;
  access_level: number;
  last_online: Date;
  created_at: Date;
  updated_at: Date;
}

interface organisers {
  id: number;
  organiser_name: string;
  date_joined: Date;
  user_id: number;
  organisation_pic: string;
  organisation_details: string;
  created_at: Date;
  updated_at: Date;
}

interface shows {
  id: number;
  organiser_id: number;
  category_id: number;
  show_name: string;
  show_duration: number;
  sales_start_date: Date;
  sales_end_date: Date;
  published: boolean
  launch_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
  details: JSON,

}

interface categories{
  id : number;
  category: string;
  created_at: Date;
  updated_at: Date;
}

interface locations{
  id:number;
  venue:string;
  address:string;
  capacity:number;
  created_at:Date;
  updated_at:Date;
}

interface show_locations{
  id: number;
  show_id:number;
  location_id:number;
  created_at: Date;
  updated_at: Date;
}

interface images{
  id: number;
  show_id : number | null;
  organiser_id: number | null;
  path: string;
  created_at: Date;
  updated_at: Date;
}

interface discounts{
  discount_type:string;
  discount:number;
}

interface ticket_discount{
  early_discount:boolean;
  discount:number;
  early_date: Date | null;
  other_discount: discounts | null
}

interface tickets{
  id:number;
  created_at: Date;
  updated_at: Date;
  show_id: number;
  type: string;
  pricing: number;
  show_date: Date;
  max_quantity: number;
  ticket_discount: ticket_discount;
}

interface users_purchase{
  id:number;
  user_id:number;
  created_at: Date;
  updated_at: Date;
  ticket_id: number;
  quantity: number;
  ticket_paid: boolean;
  purchase_date: Date | null
}

interface favourites {
  id:number;
  created_at: Date;
  updated_at: Date;
  show_id: number;
  user_id: number;
}

interface chatrooms{
  id:number;
  created_at: Date;
  updated_at: Date;
  chatroom_name: string;
  show_id: number;
}

interface chatroom_participants {
  id:number;
  created_at: Date;
  updated_at: Date;
  chatroom_id: number;
  user_id: number;
}

interface chatroom_messages{
  id:number;
  created_at: Date;
  updated_at: Date;
  chatroom_id: number;
  user_id: number;
  content_type: number;
  content: string;
  message_time: Date;
}

interface direct_messages {
  id:number;
  created_at: Date;
  updated_at: Date;
  from_user: number;
  to_user: number;
  content_type: number;
  content: string;
}

async function main() {
  await client.connect(); // "dial-in" to the postgres server
  console.log('db is connected')

  // init wb files as variables
  let usersSheet = wb.Sheets["users"]
  let organiserSheet = wb.Sheets["organiser_list"]
  let categoriesSheet = wb.Sheets["categories"]
  let showsSheet = wb.Sheets["shows"]
  let locationsSheet = wb.Sheets["locations"]
  let showLocationsSheet = wb.Sheets["shows_locations"]
  let imagesSheet = wb.Sheets["images"]
  let ticketsSheet = wb.Sheets["tickets"]
  let usersPurchasesSheet = wb.Sheets["users_purchases"]
  let favouritesSheet = wb.Sheets["favourites"]
  let chatroomsSheet = wb.Sheets["chatrooms"]
  let chatroomParticipantSheet = wb.Sheets["chatroom_participants"]
  let chatroomMessagesSheet = wb.Sheets["chatroom_messages"]
  let directMessagesSheet = wb.Sheets["direct_messages"]

  //init data from wb sheets as json file
  let usersSheetData: users[] = XLSX.utils.sheet_to_json(usersSheet);
  let organiserSheetData: organisers[]  = XLSX.utils.sheet_to_json(organiserSheet);
  let showsSheetData : shows[]= XLSX.utils.sheet_to_json(showsSheet);
  let categoriesSheetData : categories[]= XLSX.utils.sheet_to_json(categoriesSheet);
  let locationsSheetData : locations[]= XLSX.utils.sheet_to_json(locationsSheet);
  let showLocationsSheetData : show_locations[] = XLSX.utils.sheet_to_json(showLocationsSheet); 
  let imagesSheetData : images[] = XLSX.utils.sheet_to_json(imagesSheet);
  let ticketsSheetData : tickets[]= XLSX.utils.sheet_to_json(ticketsSheet);
  let usersPurchasesSheetData : users_purchase[] = XLSX.utils.sheet_to_json(usersPurchasesSheet);
  let favouritesSheetData : favourites[]= XLSX.utils.sheet_to_json(favouritesSheet);
  let chatroomsSheetData : chatrooms[]= XLSX.utils.sheet_to_json(chatroomsSheet);
  let chatroomParticipantSheetData : chatroom_participants[]= XLSX.utils.sheet_to_json(chatroomParticipantSheet);
  let chatroomMessagesSheetData : chatroom_messages[]= XLSX.utils.sheet_to_json(chatroomMessagesSheet);
  let directMessagesSheetData : direct_messages[]= XLSX.utils.sheet_to_json(directMessagesSheet);

  console.log('user data upload start')
  for (let users of usersSheetData) {
    await client.query("INSERT INTO users (id,first_name,last_name,email,phone_number,icon,password,access_level,last_online,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [
      users.id,
      users.first_name,
      users.last_name,
      users.email,
      users.phone_number,
      users.icon,
      users.password,
      users.access_level,
      users.last_online,
      users.created_at,
      users.updated_at
    ])
  }
  console.log('user data upload complete\n')

  console.log('organiser_list data upload start')
for(let organisers of organiserSheetData){
  await client.query('INSERT INTO organiser_list (id,organiser_name,date_joined,user_id,organisation_pic,organisation_details,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8)',[
    organisers.id,
    organisers.organiser_name,
    organisers.date_joined,
    organisers.user_id,
    organisers.organisation_pic,
    organisers.organisation_details,
    organisers.created_at,
    organisers.updated_at
  ])
}
console.log('organiser_list data upload complete \n')

console.log('categories data upload start')
for(let category of categoriesSheetData){
  await client.query('INSERT INTO categories(id,category,created_at,updated_at) values ($1,$2,$3,$4)',[
    category.id,
    category.category,
    category.created_at,
    category.updated_at
  ])
}
console.log('categories data upload complete\n')

console.log('shows data upload start')
  for (let shows of showsSheetData) {
    await client.query('INSERT INTO shows (id,organiser_id,category_id,show_name,details,show_duration,sales_start_date,sales_end_date,published,launch_date,end_date,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',[
      shows.id,
      shows.organiser_id,
      shows.category_id,
      shows.show_name,
      shows.details,
      shows.show_duration,
      shows.sales_start_date,
      shows.sales_end_date,
      shows.published,
      shows.launch_date,
      shows.end_date,
      shows.created_at,
      shows.updated_at
    ])
  }
  console.log('shows data upload complete\n')

console.log('locations data upload start')
for(let location of locationsSheetData){
  await  client.query('INSERT INTO locations (id,venue,address,capacity, created_at,updated_at) values ($1,$2,$3,$4,$5,$6)',[
    location.id,
    location.venue,
    location.address,
    location.capacity,
    location.created_at,
    location.updated_at
  ])
}
console.log('locations data upload complete\n')

console.log('shows_locations upload start')
for(let show_location of showLocationsSheetData){
  await client.query('INSERT INTO shows_locations (id,show_id,location_id,created_at,updated_at) values ($1,$2,$3,$4,$5)',[
    show_location.id,
    show_location.show_id,
    show_location.location_id,
    show_location.created_at,
    show_location.updated_at
  ])
}
console.log('shows_locations upload complete\n')

console.log('images data upload start')
for (let image of  imagesSheetData){
  await client.query('INSERT INTO images (id,show_id,organiser_id,path,created_at,updated_at) values ($1,$2,$3,$4,$5,$6)',[
    image.id,
    image.show_id,
    image.organiser_id,
    image.path,
    image.created_at,
    image.updated_at
  ])
}
console.log('images data upload complete\n')

console.log('tickets data upload start')
for (let ticket of ticketsSheetData){
  await client.query('INSERT INTO tickets (id,show_id,type,pricing,show_date,max_quantity,ticket_discount,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)',[
    ticket.id,
    ticket.show_id,
    ticket.type,
    ticket.pricing,
    ticket.show_date,
    ticket.max_quantity,
    ticket.ticket_discount,
    ticket.created_at,
    ticket.updated_at
  ])
}
console.log('tickets data upload complete\n')

console.log('users_purchases data upload start')
for (let purchase of usersPurchasesSheetData){
  await client.query('INSERT INTO users_purchases (id,user_id,ticket_id,quantity,ticket_paid,purchase_date,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8)',[
    purchase.id,
    purchase.user_id,
    purchase.ticket_id,
    purchase.quantity,
    purchase.ticket_paid,
    purchase.purchase_date,
    purchase.created_at,
    purchase.updated_at
  ])
}
console.log('users_purchases data upload complete\n')

console.log('favourites data upload start')
for (let favourite of favouritesSheetData){  
  await client.query('INSERT INTO favourites (id,show_id,user_id,created_at,updated_at) values ($1,$2,$3,$4,$5)',[
    favourite.id,
    favourite.show_id,
    favourite.user_id,
    favourite.created_at,
    favourite.updated_at
    ])
  }
console.log('favourites data upload complete\n')

console.log('chatrooms data upload start')
for (let chatroom of chatroomsSheetData){
  await client.query('INSERT INTO chatrooms (id,chatroom_name,show_id,created_at,updated_at) values ($1,$2,$3,$4,$5)',[
    chatroom.id,
    chatroom.chatroom_name,
    chatroom.show_id,
    chatroom.created_at,
    chatroom.updated_at
  ])
}
console.log('chatrooms data upload complete\n')

console.log('chatroom_participants data upload start')
for (let participants of chatroomParticipantSheetData){
  await client.query('INSERT INTO chatroom_participants (id, chatroom_id,user_id,created_at,updated_at) values ($1,$2,$3,$4,$5)',[
    participants.id,
    participants.chatroom_id,
    participants.user_id,
    participants.created_at,
    participants.updated_at
  ])
}
console.log('chatroom_participants upload complete\n')

console.log('chatroom_messages data upload start')
for (let messages of chatroomMessagesSheetData){
  await client.query('INSERT INTO chatroom_messages (id, chatroom_id,user_id,content_type,content,message_time,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8)',[
    messages.id,
    messages.chatroom_id,
    messages.user_id,
    messages.content_type,
    messages.content,
    messages.message_time,
    messages.created_at,
    messages.updated_at
  ])
}
console.log('chatroom_messages data upload complete\n')

console.log('direct_messages data upload start')
for (let direct of directMessagesSheetData){
  await client.query('INSERT INTO direct_messages (id,from_user,to_user,content_type,content,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7)',[
    direct.id,
    direct.from_user,
    direct.to_user,
    direct.content_type,
    direct.content,
    direct.created_at,
    direct.updated_at
  ])
}
console.log('direct_messages data upload complete\n')


  await client.end()
  console.log('db is disconnected')
}
main();