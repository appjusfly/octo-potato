import React, { useState, useEffect } from "react";
import { hubspot, Flex, Text, Button } from "@hubspot/ui-extensions";

hubspot.extend(({ context, actions }) => (
  <Extension context={context} fetchProperties={actions.fetchCrmObjectProperties} />
));

const Extension = ({ context, fetchProperties }) => {
  const [properties, setProperties] = useState(null);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    fetchProperties(["dealname", "amount", "dealstage", "closedate", "pipeline"])
      .then(setProperties)
      .catch(() => setProperties({}));
  }, []);

  if (!properties) {
    return (
      <Flex direction="column" gap="medium">
        <Text>Loading deal data...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="medium">
      <Text format={{ fontWeight: "bold" }}>Deal Overview</Text>
      <Text>Name: {properties.dealname || "—"}</Text>
      <Text>
        Amount:{" "}
        {properties.amount
          ? `$${Number(properties.amount).toLocaleString()}`
          : "—"}
      </Text>
      <Text>Stage: {properties.dealstage || "—"}</Text>
      <Text>Close Date: {properties.closedate || "—"}</Text>
      <Text>Pipeline: {properties.pipeline || "—"}</Text>
      <Button
        onClick={() => setReviewed(true)}
        variant="primary"
        disabled={reviewed}
      >
        {reviewed ? "Marked as Reviewed" : "Mark as Reviewed"}
      </Button>
    </Flex>
  );
};
