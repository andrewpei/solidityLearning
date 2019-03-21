pragma solidity ^0.5.6;

contract CampaignFactory {
  address[] public deployedCampaigns;

  function createCampaign(uint minimum) public {
    address newCampaign = address(new Campaign(minimum, msg.sender));
    deployedCampaigns.push(newCampaign);
  }

  function getDeployedCampaigns() public view returns (address[] memory) {
    return deployedCampaigns;
  }
}

contract Campaign {
  struct Request {
    string description;
    uint value;
    address payable recipient;
    bool complete;
    uint approvalCount;
    mapping(address => bool) backers;
  }
  
  Request[] public requests;
  address public manager;
  mapping(address => bool) public approvers;
  uint public approversCount;
  uint public minimumContribution;
  
  modifier restricted() {
    require(msg.sender == manager);
    _;
  }
  
  constructor(uint minium, address creator) public {
    manager = creator;
    minimumContribution = minium;
  }
  
  function contribute() public payable {
    require(msg.value > minimumContribution);
    approvers[msg.sender] = true;
    approversCount++;
  }
  
  function createRequest(
    string memory description, 
    uint value, 
    address payable recipient) 
  public restricted {
    Request memory newRequest = Request({
      description: description,
      value: value,
      recipient: recipient,
      complete: false,
      approvalCount: 0
      });
    
    requests.push(newRequest);
  }
  
  function approveRequest(uint requestIndex) public {
    Request storage request = requests[requestIndex];
    
    require(approvers[msg.sender]);
    require(!request.backers[msg.sender]);
    
    request.backers[msg.sender] = true;
    request.approvalCount++;
  }
  
  function finalizeRequest(uint requestIndex) public restricted {
    Request storage request = requests[requestIndex];

    require(request.approvalCount > (approversCount / 2));
    require(!request.complete);

    request.recipient.transfer(request.value);
    request.complete = true;
  }

  function getSummary() public view returns(
    uint,
    uint,
    uint,
    uint,
    address
  ) {
    return (
      minimumContribution,
      address(this).balance,
      requests.length,
      approversCount,
      manager
    );
  }

  function getRequestsCount() public view returns(uint) {
    return requests.length;
  }
}