import { Flex, Heading, Text } from "@chakra-ui/react";
import { useAuthUser, withAuthUser, withAuthUserTokenSSR, AuthAction } from 'next-firebase-auth';
import { getFirebaseAdmin } from 'next-firebase-auth';
import firebase from 'firebase/app';
import 'firebase/firestore';

const SingleEvent = ({ itemData }) => {
  return (
    <>
      <Flex>
        <Heading>{itemData.name}</Heading>
      </Flex>

      <Flex>
        <Text>{itemData.fgType}</Text>
      </Flex>

      <Flex>
        <Text>{itemData.date}</Text>
      </Flex>
    </>
  );
};

//checking to make sure authenticated if not go back to login page
export const getServerSideProps = withAuthUserTokenSSR({

  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})

  (
    async ({ AuthUser, params }) => {

      //to get access tot he firestore database
      const db = getFirebaseAdmin().firestore();

      //query finding from the database the events collection and grabbing the params.id from it
      const doc = await db.collection("events").doc(params.id).get();

      let itemData;
      if (!doc.empty) { // if doc is found

        // if doc.data was found return into itemData variable
        itemData = {
          id: doc.id,
          name: doc.data().game,
          date: doc.data().date.toDate().toDateString(),
          fgType: doc.data().fgType
        }
      }

      // if doc.data was not found return nothing
      else {
        itemData = null;
      }

      //return the data found

      return {
        props: {
          itemData
        }
      }
    }
  )

// to make sure it will render ONLY if authenticated
export default withAuthUser(
  {
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
  }
)(SingleEvent) //function that holds the component that needs to be rendered