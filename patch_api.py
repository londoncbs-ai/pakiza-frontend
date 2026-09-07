import re

with open('src/api/matchAdvisors.ts', 'r') as f:
    content = f.read()

new_method = """
  completeOffer(offerId: string, rating: number) {
    return api.post<MatchAdvisorOffer>(`/match-advisors/offers/${offerId}/complete?rating=${rating}`).then((r) => r.data);
  },
};
"""

content = content.replace("};", new_method.strip())

with open('src/api/matchAdvisors.ts', 'w') as f:
    f.write(content)
