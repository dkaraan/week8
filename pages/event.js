import React, { useState, useEffect } from 'react'
import {
    Flex,
    Heading,
    InputGroup,
    InputLeftElement,
    Input,
    Button,
    Text,
    IconButton,
    Divider,
} from "@chakra-ui/react"
import DarkModeSwitch from '../components/DarkModeSwitch'
import {
    useAuthUser,
    withAuthUser,
    withAuthUserTokenSSR,
    AuthAction,
} from 'next-firebase-auth'
import getAbsoluteURL from '../utils/getAbsoluteURL'
import { AddIcon, DeleteIcon, StarIcon } from "@chakra-ui/icons"
import firebase from 'firebase/app'
import 'firebase/firestore'

const Event = () => {
  const AuthUser = useAuthUser()
  const [inputName, setInputName] = useState('')
  const [inputDate, setInputDate] = useState('')
  const [events, setEvents] = useState([])

  console.log("the AuthUser is = " + AuthUser.id)
  console.log(events)

  useEffect(() => {
    AuthUser.id &&
      firebase
        .firestore()
        .collection("events")
        .where( 'user', '==', AuthUser.id )
        .onSnapshot(
          snapshot => {
            setEvents(
              snapshot.docs.map(
                doc => {
                  return {
                    eventID: doc.id,
                    eventName: doc.data().game,
                    eventDate: doc.data().date.toDate().toDateString(),
                    eventFgType: doc.data().fgType
                    }
                  } 
                )
               )
             }
           )
    })

    const sendData = () => {
        try {
            // try to update doc
            firebase
                .firestore()
                .collection("events") //all users will share one collection
                .add({ //.add with add documents to the events collection
                    game: inputName,
                    date: firebase.firestore.Timestamp.fromDate( new Date(inputDate) ),
                    user: AuthUser.id //how each document in events is releated back to the user
                })
                .then(console.log('Data was successfully sent to cloud firestore!'))
                setInputName('');
                setInputDate('');
        }
        
        catch (error) {
          console.log(error)
        }
    }

    const deleteEvent = (t) => {
        try {
            firebase
                .firestore()
                .collection("events")
                .doc(t) //unique identifier is passed to t and used to delete the event
                .delete()
                .then(console.log('Data was successfully deleted!'));
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Flex flexDir="column" maxW={800} align="center" justify="center" minH="100vh" m="auto" px={4}>
            <Flex justify="space-between" w="100%" align="center">
                <Heading mb={4}>Welcome, {AuthUser.email}!</Heading>
                <Flex>
                    <DarkModeSwitch />
                    <IconButton ml={2} onClick={AuthUser.signOut} icon={<StarIcon />} />
                </Flex>
            </Flex>

            <InputGroup>
                <InputLeftElement
                    pointerEvents="none"
                    children={<AddIcon color="gray.300" />}
                />

                setInputName('');
                <Input type="text" value={inputName}/*this will allow after outputting value to be reset to have nothign in the field*/ onChange={(e) => setInputName(e.target.value)} placeholder="Event name of fighting game" />

                 <Input type="text" value={inputDate}/*this will allow after outputting value to be reset to have nothign in the field*/ onChange={(e) => setInputDate(e.target.value)} placeholder="Event release date of fighting game" />
                 

                <Button
                    ml={2}
                    onClick={() => sendData()}
                >
                    Add Event
                </Button>
            </InputGroup>

            {events.map((item, i) => {
                return (
                    <React.Fragment key={i}>
                        {i > 0 && <Divider />}
                        <Flex
                            
                            w="100%"
                            p={5}
                            my={2}
                            align="center"
                            borderRadius={5}
                            justifyContent="space-between"
                        >
                            <Flex align="center">
                                <Text fontSize="xl" mr={4}>{i + 1}.</Text>
                                <Text>{item.eventName}</Text>
                                <Text>{item.eventDate}</Text>
                            </Flex>
                            <IconButton onClick={() => deleteEvent(item.eventID)} icon={<DeleteIcon />} />
                        </Flex>
                    </React.Fragment>
                )
            })}
        </Flex>
    )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, req }) => {
  return {
    props: {
    }
  }
})

export default withAuthUser({
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
})(Event)